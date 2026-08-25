async function main() {
  const res = await fetch("http://localhost:3000/menu");
  const html = await res.text();
  const unescaped = html.replace(/\\"/g, '"');
  const names = [...unescaped.matchAll(/"name":"([^"]+)"/g)].map(m => m[1]);
  console.log(`Found ${names.length} dish names in /menu response.`);
  console.log("Total unique dish names:", new Set(names).size);
  console.log("Sample 10 dishes:", names.slice(0, 10));
}

main().catch(console.error);
