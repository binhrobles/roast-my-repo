import "dotenv/config";
import dirTree from "directory-tree";
import fs from "fs";
import inquirer from "inquirer";
import openai from "./models/openai.js";

const rip_tree = (dir) => {
  let content = "";

  dir.children.forEach((child) => {
    if (!child.children) {
      // then this is a file at this level of the directory
      // rip it's contents and add to content
      content += child.path + "\n";
      content += "```\n";
      content += fs.readFileSync(child.path);
      content += "```\n\n";
    } else {
      content += rip_tree(child);
    }
  });

  return content;
};

const main = async () => {
  const repo = process.argv[2];
  const model = openai;

  const options = await inquirer
    .prompt([
      {
        type: "list",
        name: "mode",
        message: "what would you like me to do?",
        choices: [
          { name: "roast me fam", value: "roast" },
          { name: "make some edits", value: "repair" },
        ],
      },
    ]);

  const tree = dirTree(repo);
  const content = rip_tree(tree);
  fs.writeFileSync("./unified-project.md", content);

  const costEstimate = model.estimateCost(content);
  const { confirm_cost } = await inquirer.prompt({
    name: "confirm_cost",
    type: "confirm",
    message: `Estimated generation cost: $${costEstimate}\n Okay to proceed?`,
  });
  if (!confirm_cost) {
    console.log("fine then");
    process.exit(0);
  }

  const response = await model.getPrediction(content, options);
  const responseContent = response?.choices[0].message.content;

  if (options.mode === 'repair') {
    response.files.forEach(file => {
      const { path, descriptionOfChanges, fileContent } = file;
      fs.writeFileSync(path, JSON.parse(fileContent));
      console.log(`Changed ${path} -- ${descriptionOfChanges}`);
    });
  }

  fs.writeFileSync("./response.json", responseContent);
  console.log(`this cost you $${model.getCost(response)}`);
};

main();
