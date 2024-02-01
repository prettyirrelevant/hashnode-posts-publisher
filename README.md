# `@prettyirrelevant/hashnode-blog`

An action for publishing articles(or posts) from your Github repository to [Hashnode](https://hashnode.com).

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/prettyirrelevant/hashnode-blog/ci.yml)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/prettyirrelevant/hashnode-blog?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/prettyirrelevant/hashnode-blog?style=for-the-badge)
![GitHub Release](https://img.shields.io/github/v/release/prettyirrelevant/hashnode-blog?style=for-the-badge)


## Usage

Create an example workflow like the following:

```yaml
name: Example Workflow
on:
  pull_request:
  push:
    branches:
      - main

jobs:
  # ... other jobs e.g. validating markdown/html files.

  publish-blog:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Publish posts
        uses: prettyirrelevant/hashnode-blog@v0.1
        with:
          supported-formats: md
          posts-directory: posts
          access-token: ${{ secrets.HASHNODE_ACCESS_TOKEN }}
          publication-id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
```

The following inputs are expected:
- `publication-id`: To get the publication ID, navigate to your blog's dashboard and grab it from the URL. The URL should look like `https://hashnode.com/<publication-id>/dashboard/`.
- `access-token`: To get your access token on Hashnode, follow the steps described in the article [here](https://support.hashnode.com/en/articles/6423579-developer-access-token).


## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
