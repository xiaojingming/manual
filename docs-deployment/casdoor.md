---
sidebar_position: 4
---

# Casdoor Basic Configuration Guide

This document describes how to configure Casdoor from scratch. Most configurations in this tutorial are already set up after installation. If you need to add users, refer to the **Add Users** section.

<span style={{color: 'red', fontWeight: 'bold'}}>Reminder again, this tutorial is an example of configuring Casdoor from scratch. Currently, Casdoor has built-in organizations and users related to costrict. You only need to add users to the costrict organization.</span> (The names of organizations and users may change due to version updates. As long as you see two organizations, the built-in organization is the admin group and can be ignored, and the other organization is the one for costrict users.)

## Configuration Page

### Accessing the Configuration Page

Visit http://\{COSTRICT_BACKEND\}:\{PORT_CASDOOR\} to access the admin login page.

```commandline
Default username: admin
Default password: 123
```

Then proceed to the admin dashboard.

## Add Organization

The organization you create here will store all CoStrict users. The organization name is not critical and can be customized.

![image-20260120095700101](./img/1-add_org-1.webp)

![image-20260120095741985](./img/1-add_org-2.webp)

## Add Application

This will be the application used for CoStrict login. The application name is not critical and can be customized.

![image-20260120095801365](./img/2-add_app-1.webp)


![image-20260120102644577](./img/2-add_app-2.webp)


> The Client ID and Client Secret correspond to the `OIDC_CLIENT_ID` and `OIDC_CLIENT_SECRET` variables in the deployment directory's `configure.sh`, for example(Note that these two IDs must be consistent with those in the OIDC configuration. Please refer to the OIDC authentication-related configuration in the deployment directory.):

```
9e2fc5d4fbcd52ef4f6f
ab5d8ba28b0e6c0d6e971247cdc1deb269c9eea3
```

> The organization field should be set to the organization created in the previous step.

![image-20260120101039642](./img/2-add_app-3.webp)



For the redirect URLs, update the IP and port to match the `COSTRICT_BACKEND_BASEURL` IP and port defined in the deployment directory's `configure.sh` file. (Note: choose http or https based on your setup. Following this tutorial completely means using http — use the actual IP and port, not variables.)

One-click deployment sets a wildcard by default. For better security, you may update this accordingly.

```
http://ip:port/oidc-auth/api/v1/plugin/login/callback
http://ip:port/oidc-auth/api/v1/manager/bind/account/callback
http://ip:port/oidc-auth/api/v1/manager/login/callback
```

![image-20260120100515628](./img/2-add_app-4.webp)

> Finally, save the current application.

## Add Users

Navigate to the organization's user list, then click Add.

![image-20260120102919337](./img/3-add_user-1.webp)

Add a demo user and click Save & Exit.

![image-20260120103025347](./img/3-add_user-2.webp)

After adding, you can update the password:

![image-20260120103919026](./img/4-update_user-1.webp)

![image-20260120103933033](./img/4-update_user-2.webp)


If you need to import users in bulk, refer to the official documentation: [Import Users from XLSX File](https://www.casdoor.org/docs/user/overview/#import-users-from-xlsx-file)

> Configuration is complete. You can now log in to CoStrict (not Casdoor) using the demo user. 

## Integrating with Third-Party Authentication Systems

![](./img/5-provider-add.webp)

Please configure according to the actual situation. The client ID and client secret can be set the same as those in the organization.
