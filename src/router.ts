
import { Router } from 'express';

import AuthRoute from './modules/auth/auth.route';
import BrandsRoute from './modules/brands/brands.route';
import CategoriesRoute from './modules/categories/categories.route';
import ChatRoute from './modules/chat/chat.route';
import ColorsRoute from './modules/colors/colors.route';
import CommentsRoute from './modules/comments/comments.route';
import CostsRoute from './modules/costs/costs.route';
import CountriesRoute from './modules/countries/countries.route';
import DownloadsRoute from './modules/downloads/downloads.route';
import {
  ContentItemsRoute,
  ContentTypesRoute,
  PageSectionsRoute,
  WebsitesRoute
} from './modules/frontend/routes';
import InteriorModelsRoute from './modules/interior_models/interior_models.route';
import InteriorsRoute from './modules/interiors/interiors.route';
import MaterialsRoute from './modules/materials/materials.route';
import ModelsRoute from './modules/models/models.route';
import NotificationsRoute from './modules/notifications/notifications.route';
import PlatformsRoute from './modules/platforms/platforms.route';
import ProductsRoute from './modules/products/products.route';
import ProjectsRoute from './modules/projects/projects.route';
import SavedInteriorsRoute from './modules/saved_interiors/saved_interiors.route';
import SavedModelsRoute from './modules/saved_models/saved_models.route';
import StatsRoute from './modules/stats/stats.route';
import StylesRoute from './modules/styles/styles.route';
import UsersRoute from './modules/users/users.route';
import UserProductViewsRoute from './modules/views/user_views/user_product_views.route';
import { WebhooksRoute } from './modules/webhooks/router';

const router = Router()

enum RoutePath {
  Base = '/',
  Frontend = '/ui',
  Webhooks = '/webhooks'
}

const routes = [
  { path: RoutePath.Base, route: new AuthRoute() },
  { path: RoutePath.Base, route: new UsersRoute() },
  { path: RoutePath.Base, route: new CategoriesRoute() },
  { path: RoutePath.Base, route: new BrandsRoute() },
  { path: RoutePath.Base, route: new ModelsRoute() },
  { path: RoutePath.Base, route: new ColorsRoute() },
  { path: RoutePath.Base, route: new MaterialsRoute() },
  { path: RoutePath.Base, route: new CostsRoute() },
  { path: RoutePath.Base, route: new StylesRoute() },
  { path: RoutePath.Base, route: new UserProductViewsRoute() },
  { path: RoutePath.Base, route: new InteriorsRoute() },
  { path: RoutePath.Base, route: new SavedInteriorsRoute() },
  { path: RoutePath.Base, route: new SavedModelsRoute() },
  { path: RoutePath.Base, route: new CommentsRoute() },
  { path: RoutePath.Base, route: new PlatformsRoute() },
  { path: RoutePath.Base, route: new NotificationsRoute() },
  { path: RoutePath.Base, route: new InteriorModelsRoute() },
  { path: RoutePath.Base, route: new ChatRoute() },
  { path: RoutePath.Base, route: new ProjectsRoute() },
  { path: RoutePath.Base, route: new StatsRoute() },
  { path: RoutePath.Base, route: new DownloadsRoute() },
  { path: RoutePath.Base, route: new ProductsRoute() },
  { path: RoutePath.Base, route: new CountriesRoute() },
  { path: RoutePath.Frontend, route: new ContentItemsRoute() },
  { path: RoutePath.Frontend, route: new WebsitesRoute() },
  { path: RoutePath.Frontend, route: new ContentTypesRoute() },
  { path: RoutePath.Frontend, route: new PageSectionsRoute() },
  { path: RoutePath.Webhooks, route: new WebhooksRoute() },
]

routes.forEach(i => router.use(i.path, i.route.router))

export default router
