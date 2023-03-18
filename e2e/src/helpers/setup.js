import { exec } from "child_process";

export async function setUp() {
  return new Promise((resolve, reject) => {
    try {
      exec("sh ./src/scripts/setup.sh", async (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
export async function tearDown() {
  return new Promise((resolve, reject) => {
    exec("./src/scripts/teardown.sh", async (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
