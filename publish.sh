#!/usr/bin/env bash

files=``
zipFileName=lambda-scaffold
lambdaName=$1

while IFS= read -r line || [[ -n "$line" ]]; do
  files="$files $line "
done < .lambda_contents

echo -e "Zipping files for deployment: ${files}\n"

rm ${zipFileName}.zip 2> /dev/null
zip -r ${zipFileName}.zip ${files} >/dev/null
echo -e "Finished zipping the project, publishing to lambda...\n"
aws lambda update-function-code --function-name ${lambdaName} --zip-file fileb://${zipFileName}.zip
echo -e "\nProject publish completed.\n"