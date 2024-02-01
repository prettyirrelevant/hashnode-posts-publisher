# `@prettyirrelevant/hashnode-blog`

An action for publishing articles(or posts) from your Github repository to [Hashnode](https://hashnode.com).

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/prettyirrelevant/hashnode-blog/ci.yml?style=for-the-badge)
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

### Inputs
- **`publication-id`**: To get the publication ID, navigate to your blog's dashboard and grab it from the URL. The URL should look like `https://hashnode.com/<publication-id>/dashboard/`.
- **`access-token`**: To get your access token on Hashnode, follow the steps described in the article [here](https://support.hashnode.com/en/articles/6423579-developer-access-token).
- **`supported-formats`**:  The file formats supported for every blog post. The values should be comma-separated if more than one format is to be supported. To learn more about what's expected from the each file format, check [here](#supported-formats).
- **`posts-directory`**: The directory from the root of the repository where the posts are stored. All trailing `\` or `/` should be removed.
-
### Supported Formats
- Markdown(.md): `draft`, if set to `true` will be ignored from the posts to be published. `title`, `tags` and `description` must be provided to avoid errors.
```md
---
title: Just hack'n a couple of projects.
draft: false
description: Nothing to see here just me messing around.
tags: ["hacking", "markdown"]
---

Blog content goes here.
```

- HTML(.html): By default, **all html posts are not drafts** i.e. it cannot be toggled like the markdown counterpart. `<title>`, `<meta name='description'>` and `<meta name='keywords'>` tags must be provided to avoid errors.
```html
<!DOCTYPE html>
<html>
<head>
    <title>Example Article</title>
    <meta name="description" content="Example Article">
    <meta name="keywords" content="example, article">
</head>
<body>
    <h1>Welcome, Example Article</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, mauris id tincidunt aliquam, elit nunc tincidunt nunc, nec tincidunt justo nunc id nunc. Sed euismod, mauris id tincidunt aliquam, elit nunc tincidunt nunc, nec tincidunt justo nunc id nunc.</p>
</body>
</html>

```
## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
