## Auth

### Signup

Endpoint `/auth/signup`

Method `POST`

Body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| full_name | min 5 | String | true |
| email | - | String | true | true |
| password | min 6 | String | true |
| language_id | - | Number | true |

### Verify

Endpoint `/auth/verify`

Method `POST`

Body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| email | - | String | true |
| code | - | String | true |

### Login

Endpoint `/auth/signin`

Method `POST`

Body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| email | - | String | true |
| password | min 6 | String | true |

### Get me

Endpoint `/me`

Method `GET`

### Resend code

Endpoint `/auth/resendcode`

Method `POST`

Body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| email | - | String | true |

### Refresh token

Endpoint `/auth/refreshToken`

Method
* `POST`

Request body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| token | - | String | true |
