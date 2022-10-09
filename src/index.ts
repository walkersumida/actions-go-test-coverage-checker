import {getInput, setFailed} from '@actions/core';
import cp from 'child_process';

const run = async () => {
  try {
    const path = getInput('path', {required: false});
    const threshold = getInput('threshold', {required: false});

    cp.execFileSync(`../sh/main.sh ${path} ${threshold}`)
  } catch (error: any) {
    setFailed(error.message);
  }
};

run();
