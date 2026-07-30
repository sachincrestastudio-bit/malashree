const fs = require("fs");
const path = require("path");

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
      results.push(filePath);
    }
  }
  return results;
}

const files = getFiles(path.join(__dirname, "src"));

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  // Add use client to page files
  if (file.includes("app") && file.endsWith("page.tsx")) {
    if (!content.includes("use client")) {
      content = '"use client";\n\n' + content;
      changed = true;
    }
  }

  // Replace Route definition
  const routeMatch = content.match(
    /export const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?component:\s*([A-Za-z0-9_]+)[,\s\S]*?\}\);/,
  );
  if (routeMatch) {
    const compName = routeMatch[1];
    content = content.replace(/export const Route = createFileRoute\([^)]+\)\(\{[\s\S]*?\}\);/, "");
    content += "\nexport default " + compName + ";\n";
    changed = true;
  }

  // Replace Link and useRouter/useNavigate imports
  if (content.includes("import {") && content.includes("@tanstack/react-router")) {
    content = content.replace(
      /import \{([^}]+)\} from ["']@tanstack\/react-router["'];/,
      (match, imports) => {
        let nextImports = "";
        if (imports.includes("Link")) {
          nextImports += 'import Link from "next/link";\n';
        }
        if (imports.includes("useNavigate") || imports.includes("useRouter")) {
          nextImports += 'import { useRouter } from "next/navigation";\n';
        }
        return nextImports;
      },
    );
    changed = true;
  }

  // Replace <Link to= with <Link href=
  if (content.includes("<Link")) {
    content = content.replace(/<Link([^>]+)to=/g, "<Link$1href=");
    changed = true;
  }

  // Replace useNavigate() with useRouter()
  if (content.includes("useNavigate()")) {
    content = content.replace(/useNavigate\(\)/g, "useRouter()");
    changed = true;
  }

  // Replace navigate({ to: '...' }) with router.push('...')
  if (content.includes("navigate({")) {
    content = content.replace(/navigate\(\{\s*to:\s*([^\s}]+)\s*\}\)/g, "router.push($1)");
    changed = true;
  }

  if (content.includes("useRouter({")) {
    // this is specific to header.tsx or similar, Tanstack router might be used differently.
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log("Updated " + file);
  }
}
