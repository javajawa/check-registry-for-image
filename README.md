<!--
SPDX-FileCopyrightText: 2020 Benedict Harcourt

SPDX-License-Identifier: BSD-2-Clause
-->

Helper action to remotely check if a docker image exists.

```yaml
  # Check to see if this image is already built (and if so, skip further steps).
  - name: Check for existing image
    id: existing-image
    uses: javajawa/check-registry-for-image@v3
    with:
      registry: ${{ env.DOCKER_REGISTRY }}  # e.g. https://aws_account_id.dkr.ecr.us-west-2.amazonaws.com
      repository: ${{ env.REPOSITORY }}     # my-awesome-project/server
      tag: ${{ env.IMAGE_TAG }}             # Maybe ${{ github.sha }} ?

  # Build and push the Docker image.
  - name: Build the Docker image
    if: ${{ steps.existing-image.outputs.exists == 'false' }}
    run: |
      docker build . -t "${{ env.DOCKER_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}"
      docker push "${{ env.DOCKER_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}"
```

The authorisation value can either by passed by the `auth` input, or it will be
automatically taken from `~/.docker/config.json`.
