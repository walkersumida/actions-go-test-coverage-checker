import * as core from '@actions/core';
import cp from 'child_process';

const buildShell = (): string => {
  const path = core.getInput('path', {required: false});
  const threshold = core.getInput('threshold', {required: false});
  return `#!/bin/bash
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
fi`;
};

// TODO: ↑ exit 1するとその場で強制終了になるため、ログが出てこない。このexit 1以外に失敗したということを伝達する方法があるのか。またはこの exit 1の部分だけ別で実行すれば実行ログは出せるかも。

const run = async () => {
  try {
    const shell = buildShell();

    core.startGroup('go test coverage');
    let result = (cp.execSync(shell, {shell: '/bin/bash'}) || '').toString();
    core.info(result);
    core.endGroup();
  } catch (error: any) {
    core.setFailed(error.message);
  }
};

run();
