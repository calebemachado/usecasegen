# Contributing to usecasegen

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## Development Process

1. Fork the repository
2. Create a branch following our naming conventions
3. Make your changes
4. Submit a pull request

## Branch Naming Conventions

We follow strict branch naming conventions to keep our repository organized.

All branches must follow this format:

```
<type>/<description>
```

Where `<type>` is one of:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `hotfix/` - Urgent fixes for production
- `chore/` - Maintenance tasks, refactoring, etc.
- `docs/` - Documentation updates
- `test/` - Adding or updating tests
- `release/` - Release branches

For more detailed information, see [BRANCH_NAMING.md](.github/BRANCH_NAMING.md).

## Pull Request Process

1. Ensure your code adheres to the existing style and passes all tests
2. Update documentation if necessary
3. Submit your pull request with a clear description of the changes
4. Wait for a review from a maintainer

## Code Style

- Follow the established code style in the project
- Run `npm run fix` before committing to fix code style issues

## Testing

- Add tests for new features
- Make sure all tests pass by running `npm test`

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license.
