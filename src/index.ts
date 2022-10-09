import {getInput, setFailed} from '@actions/core';
import cp from 'child_process';

const run = async () => {
  try {
    const path = getInput('path', {required: false});
    const threshold = getInput('threshold', {required: false});
    var shell = `#!/bin/bash
argPath=${path}
argThreshold=${threshold}

go test -cover $argPath -coverprofile=cover.out

tests=\`go tool cover -func=cover.out\`
failed=false

echo "Threshold: $argThreshold"

while IFS= read -r t
do
  num=\`echo $t | grep -Eo '[0-9]+\.[0-9]+'\`
  if (( $(echo "$num $argThreshold" | awk '{print ($1 < $2)}') )) ; then
    COLOR=red;
    failed=true
    echo $t;
  else
    COLOR=green;
    echo $t;
  fi
done <<< "$tests"

if $failed ; then
  echo "Failed"
  exit 1
fi`;

    cp.execSync(shell, {shell: '/bin/bash'});
  } catch (error: any) {
    setFailed(error.message);
  }
};

run();
