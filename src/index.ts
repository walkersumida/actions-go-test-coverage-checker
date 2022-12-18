import * as core from '@actions/core';
import {spawnSync, SpawnSyncReturns} from 'child_process';

const COL_FILE_PATH = 0;
const COL_FUNC_NAME = 1;
const COL_COVERAGE = 2;

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

interface TestResult {
  path: string;
  funcName: string;
  coverage: number;
}

const parseTestResult = (result: string): TestResult => {
  const cols = result.split(/\t/);
  let buildCols = [];
  for (let i = 0; i < cols.length; i++) {
    if (cols[i] != "") {
      buildCols.push(cols[i]);
    }
  }

  return {
    path: buildCols[COL_FILE_PATH],
    funcName: buildCols[COL_FUNC_NAME],
    coverage: Number(buildCols[COL_COVERAGE].replace("%", "")),
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
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row != "") {
        const testResult = parseTestResult(row);
        core.info(`path: ${testResult.path}, funcName: ${testResult.funcName}, coverage: ${testResult.coverage}`);
      }
    }
    core.endGroup();
  } catch (error: any) {
    core.setFailed(error.status);
    core.setFailed(error.message);
    core.setFailed(error.stderr.toString());
    core.setFailed(error.stdout.toString());
  }
};

run();
