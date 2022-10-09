import {getInput, setFailed} from '@actions/core';
import cp from 'child_process';

const run = async () => {
  try {
    const path = getInput('path', {required: false});
    let buf = cp.execSync('go test -v ' + path);
  } catch (error: any) {
    setFailed(error.message);
  }
};

run();
