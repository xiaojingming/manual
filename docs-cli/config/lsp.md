---
sidebar_position: 8
---
# LSP

## Overview

CoStrict integrates the Language Server Protocol (LSP) to help large language models interact with your codebase. It leverages diagnostic information to provide feedback to the large language model.

## Usage

CoStrict has built-in LSP for mainstream languages by default.

Set the environment variable COSTRICT_EXPERIMENTAL_LSP_TOOL=1 to enable the LSP tool.

## Testing

{/* ![img](img/lsp/png.png)

![img](img/lsp/png-17700909060241.png) */}



**Note**: LSP programs are placed in the ~\.local\share\costrict\bin\ directory by default. If LSP is not available for some languages, you can manually download and place them in this directory, such as for the Go language:

{/* ![img](img/lsp/png-17700909060242.png) */}
