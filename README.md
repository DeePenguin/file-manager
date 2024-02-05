# file-manager
### How to run project locally
1. Clone this repo
2. Switch to `development` branch
3. Start application via
  ```bash
   npm run start -- --username YOUR_USERNAME
   ```

#### Available commands

Please note that paths containing whitespaces must be escaped. You can choose one of these variants:
 - `"wrap/me in/ doublequotes"`
 - `'wrap/me in/ singlequotes'`
 -  `ecape/whitespace\ by/backslash`
   

| Command                      | What it does                       | Notes                            |
|------------------------------|------------------------------------|----------------------------------|
| `start --username YOUR_USERNAME` | Run the cli application           | `--username` value is not required for correct work |
| `up` | Set parent directory as cwd | |
|`cd path_to_directory` | Set provided path as cwd | |
|`ls`| Print cwd content to terminal | |
|`cat path_to_file| Print file content to terminal | |
|`add new_file_name`| Create empty file in cwd |  |
|`rn path_to_file new_filename`|Rename file  | If new path is provided to `new_filename`, file will remain in its original directory   |
|`cp path_to_source path_to_new_directory`|Copy file or directory  |  |
|`mv path_to_source path_to_new_directory`|Move file or directory   |   |
|`rm path_to_source`| Delete file or directory |  |
|`os --EOL`|Print default system End-Of-Line to terminal  | You won't see it   |
|`os --cpus`| Print host machine CPUs info  to terminal |  |
|`os --homedir`| Print home directory to terminal |  |
|`os --username`| Print system user name to terminal |  |
|`os --architecture`| Print CPU architecture for which Node.js binary has compiled to terminal |  |
|`hash path_to_file`| Print hash for file to terminal |  |
|`compress path_to_file path_to_destination`| Compress file using Brotli algorithm | `path_to_destination` should be directory |
|`decompress path_to_file path_to_destination`| Decompress file | `path_to_destination` should be directory  |
