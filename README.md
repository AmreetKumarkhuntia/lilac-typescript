# Lilac TypeScript

A Node.js process logger for backend applications.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

To install the package run the following commands:

Installing package

```typescript
npm i lilac-typescript
```

## Usage

Here’s a simple example of how to use the logger:

1. Importing the package:

```typescript
import { ProcessLogger } from 'lilac-typescript/src';
```

2. Initiating the ProcessLogger:

```typescript
export const logger = new ProcessLogger();
```

3. Using the logger:

```typescript
import { logger } from '$server/logger'; // change whatever the logger path is

export function myFunction(input: object): object {
  const output: object = {
    id: '1234',
    name: 'Aleshan',
  };
  const functionName: string = 'myFunction';
  logger.logFunctionCalled(functionName, { input });
  logger.logFunctionCallResult(functionName, { output });

  return output;
}
```

## Examples

Here is an example of logging:

![lilac](https://github.com/user-attachments/assets/06c93b1f-b219-4ce0-ad66-b253c699e14f)

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a pull request and add changelog along with test screenshot

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any inquiries, please reach out to:

- **Author**: Amreet Khuntia
- **GitHub**: [Amreet Khuntia](https://github.com/AmreetKumarkhuntia)
