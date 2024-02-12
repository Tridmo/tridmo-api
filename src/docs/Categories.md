## Categories

### Create

Endpoint `/categories`

Method `POST`

Headers `Authorization: Bearer token`

Body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| name | - | String | true |
| description | - | String | false |
| parent_id | - | String | false |

### Update

Endpoint `/categories/id`

Method `PUT`

Headers `Authorization: Bearer token`

Body:
| Name | Description | Type | Required |
| ----------- | ----------- | ---- | --- |
| name | - | String | false |
| description | - | String | false |
| parent_id | - | String | false |

### Delete

##### Request

Endpoint `/categories`

Method `DELETE`

Headers `Authorization: Bearer token`

### Get all

Endpoint `/categories`

Method `GET`

### Get main

Endpoint `/categories/main`

Method `GET`

### Get by main

Endpoint `/categories/in/id`

Method `GET`

### Get one

Endpoint `/categories/id`

Method `GET`