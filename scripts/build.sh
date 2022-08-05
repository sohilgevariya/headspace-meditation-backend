# If the directory, `dist`, doesn't exist, create `dist`
stat build || mkdir build
# Archive artifacts
# cd build
zip build/GrubGrams.zip -r build package.json config .platform node_modules .platform