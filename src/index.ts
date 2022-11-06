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
echo "$tests"
`;
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
    output(result);
    core.endGroup();

    core.startGroup('test coverage');
    const coverageShell = buildCoverageShell();
    result = spawnSync(coverageShell, {shell: '/bin/bash'});
    const rows = result.stdout.toString().split(/\n/);
    core.info("row 1:" + rows[0]);
    const cols = rows[0].split(/\t/)
    core.info("col 1:" + cols[0])
    core.info("col 2:" + cols[1])
    core.info("col 3:" + cols[2])
    core.info("col 4:" + cols[3])
    core.info("col 1:" + cols[0])
    core.info("row 2:" + rows[1]);
    core.info("row 3:" + rows[2]);
    core.info("row 4:" + rows[3]);
    // output(result);
    core.endGroup();
  } catch (error: any) {
    core.setFailed(error.status);
    core.setFailed(error.message);
    core.setFailed(error.stderr.toString());
    core.setFailed(error.stdout.toString());
  }
};

run();
