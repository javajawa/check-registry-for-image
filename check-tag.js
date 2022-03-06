// SPDX-FileCopyrightText: 2020 Benedict Harcourt
//
// SPDX-License-Identifier: BSD-2-Clause

const core     = require("@actions/core");
const requests = require("r2");
const fs       = require("fs");

const mime = "application/vnd.docker.distribution.manifest.v2+json";

// Based on https://dille.name/blog/2018/09/20/how-to-tag-docker-images-without-pulling-them/
async function main() {
    const registry   = core.getInput("registry");
    const repository = core.getInput("repository");
    const tag        = core.getInput("tag");

    const auth = getAuth(registry);

    core.debug("Registry:   " + registry);
    core.debug("Repository: " + repository);
    core.debug("Tag:        " + tag);

    const checkUrl = `https://${registry}/v2/${repository}/manifests/${tag}`;

    core.debug("Checking for manifest at " + checkUrl);

    const manifest = await requests.get(
        checkUrl,
        {
            headers: {
                "Accept": mime,
                "Authorization": auth
            }
        }
    ).response;

    if (manifest.status === 404) {
        core.setOutput("exists", false);
        return;
    }

    manifest.json()
        .then(mj => core.setOutput("exists", true))
        .catch(e => {
            core.debug(e.message);
            core.setOutput("exists", false)
        });
}

function getAuth(registry) {
    const auth = core.getInput("auth");

    if (auth) {
        return auth;
    }

    const home      = process.env.HOME;
    const rawConfig = fs.readFileSync(home + "/.docker/config.json");
    const config    = JSON.parse(rawConfig);

    if (!("auths" in config)) {
        core.setFailed("No docker authorization info found");
        return;
    }

    const auths = config.auths;

    if (!(registry in auths)) {
        core.setFailed("No docker authorisation for " + registry);
        return;
    }

    core.setSecret(auths[registry].auth);

    return "Basic " + auths[registry].auth;
}

main().catch(error => core.setFailed(error.message));

// vim: nospell ts=4 expandtab
