import * as core from '@actions/core';
import {spawnSync, SpawnSyncReturns} from 'child_process';

const buildGoTestShell = (): string => {
  const path = core.getInput('path', {required: false});

  return `#!/bin/bash
argPath=${path}

go test $argPath -cover -coverprofile=cover.out`;
};

const buildCoverageShell = (): string => {
  const threshold = core.getInput('threshold', {required: false});

  return `#!/bin/bash
argThreshold=${threshold}

tests=\`go tool cover -func=cover.out\`
failed=false

echo "Threshold: $argThreshold"
echo $tests

while IFS= read -r t
do
  num=\`echo $t | grep -Eo '[0-9]+\.[0-9]+'\`
  if (( $(echo "$num $argThreshold" | awk '{print ($1 < $2)}') )) ; then
    failed=true
    echo $t;
  else
    echo $t;
  fi
done <<< "$tests"

if $failed ; then
  echo "Failed"
  exit 1
fi`;
};

const output = (result: SpawnSyncReturns<Buffer>): void => {
  if (result.status == 1) {
    core.setFailed('Failed');
    core.error(result.stdout.toString());
  } else {
    core.info(result.stdout.toString());
  }
}

const run = async () => {
  try {
    core.startGroup('go test');
    const goTestShell = buildGoTestShell();
    let result = spawnSync(goTestShell, {shell: '/bin/bash'});
    let stdout = result.stdout.toString();
    output(result);
    core.endGroup();

    core.startGroup('test coverage');
    const coverageShell = buildCoverageShell();
    result = spawnSync(coverageShell, {shell: '/bin/bash'});
    output(result);
    core.endGroup();
  } catch (error: any) {
    core.setFailed(error.status);
    core.setFailed(error.message);
    core.setFailed(error.stderr.toString());
    core.setFailed(error.stdout.toString());
  }
};

run();
