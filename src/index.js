import "dotenv/config";
import dirTree from "directory-tree";
import fs from "fs/promises"; // Use promise-based fs
import inquirer from "inquirer";

import openai from "./models/openai.js";

const rip_tree = async (dir) => { // Made the function async
  let content = "";

  for (const child of dir.children) { // Use for...of loop for async/await
    if (!child.children) {
      // then this is a file at this level of the directory
      // rip its contents and add to content
      content += child.path + "\n";
      content += "```\n";
      try {
        content += await fs.readFile(child.path, 'utf8'); // Read file asynchronously with encoding
      } catch (error) {
        console.error(`Error reading file ${child.path}:`, error); // Improved error handling
      }
      content += "```\n\n";
    } else {
      content += await rip_tree(child); // Await recursive call
    }
  }

  return content;
};

const main = async () => {
  const repo = process.argv[2];
  const model = openai;

  try {
    const options = await inquirer
      .prompt([
        {
          type: "list",
          name: "mode",
          message: "What would you like me to do?",
          choices: [
            { name: "roast me fam", value: "roast" },
            { name: "make some edits", value: "repair" },
          ],
        },
      ]);

    const tree = dirTree(repo);
    const content = await rip_tree(tree);
    await fs.writeFile("./unified-project.md", content, 'utf8'); // Write file asynchronously with encoding

    const costEstimate = model.estimateCost(content);
    const { confirm_cost } = await inquirer.prompt({
      name: "confirm_cost",
      type: "confirm",
      message: `Estimated generation cost: $${costEstimate}\n Okay to proceed?`,
    });
    if (!confirm_cost) {
      console.log("Operation cancelled."); // Clearer message
      process.exit(0);
    }

    const response = await model.getPrediction(content, options);
    const responseContent = response?.choices[0].message.content;
    await fs.writeFile("./response.json", responseContent, 'utf8'); // Write file asynchronously with encoding
    console.log(`This cost you $${model.getCost(response)}`);

    if (options.mode === 'repair') {
      const responseObject = JSON.parse(responseContent);
      for (const file of responseObject.files) { // Use for...of loop
        const { path, descriptionOfChanges, fileContent } = file;
        await fs.writeFile(path, fileContent, 'utf8'); // Write file asynchronously with encoding
        console.log(`Changed ${path} -- ${descriptionOfChanges}`);
      }
    }

    if (options.mode === 'roast') {
        const responseObject = JSON.parse(responseContent);
        await fs.writeFile('roast.html', responseObject.html, 'utf8');
        console.log(`Open roast.html`);
    }
  } catch (error) {
    console.error("An error occurred:", error); // General error handling
  }
};

main();
