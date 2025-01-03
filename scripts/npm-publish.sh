echo -e "\033[1;34m##############################\033[0m"
echo -e "\033[1;32m  🎉 Bundling Package... 🚀\033[0m"
npm run build

echo -e "\033[1;34m##############################\033[0m"
echo -e "\033[1;35m  🚀 Publishing Package to npm... 🛠️\033[0m"
npm publish
