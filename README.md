# `@prettyirrelevant/hashnode-posts-publisher`

Publish blog posts from your GitHub repository to Hashnode with this GitHub Action.

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/prettyirrelevant/hashnode-posts-publisher/ci.yml?style=for-the-badge) ![GitHub License](https://img.shields.io/github/license/prettyirrelevant/hashnode-posts-publisher?style=for-the-badge) ![GitHub Release](https://img.shields.io/github/v/release/prettyirrelevant/hashnode-posts-publisher?style=for-the-badge)

## Usage

To use this action, create a workflow like below:

```yaml
name: Publish Blog Posts
on:
  pull_request:
  push:

jobs:
  # ... other jobs e.g. validating markdown/html files.

  publish:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Publish to Hashnode
      uses: prettyirrelevant/hashnode-posts-publisher@v0.1.1
      with:
        posts-directory: posts
        supported-formats: md,html
        access-token: ${{ secrets.HASHNODE_TOKEN }}
        publication-id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
```

### Inputs

- `supported-formats`: The file formats to publish, comma separated. Supported values are `md` for Markdown and `html`. Default is `md`.
- `access-token`: Your Hashnode API access token, available in your [Hashnode account settings](https://hashnode.com/settings/developer).
- `publication-id`: The unique ID of your Hashnode blog, available in the URL when viewing your blog's dashboard. The URL should look like `https://hashnode.com/<publication-id>/dashboard`.
- `posts-directory`: The directory in your repository containing the blog posts.

### Post Format

For Markdown, include YAML frontmatter:

```md
---
title: My Blog Post
draft: true
description: example description
tags: ["blogging", "hello"]
---

Post contents...
```

For HTML, include `<title>`, `<meta>` tags:

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

> [!NOTE]
> HTML posts will always be published i.e. `draft` cannot be toggled like Markdown files.

## License

This project is open source under the [MIT license](LICENSE).
