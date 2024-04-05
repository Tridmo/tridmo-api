import { Router } from 'express';

import AuthRoute from './modules/auth/auth.route';
import UsersRoute from './modules/users/users.route';
import CategoriesRoute from './modules/categories/categories.route';
import BrandsRoute from './modules/brands/brands.route';
import ModelsRoute from './modules/models/models.route';
import ColorsRoute from './modules/colors/colors.route';
import MaterialsRoute from './modules/materials/materials.route';
import CostsRoute from './modules/costs/costs.route';
import StylesRoute from './modules/styles/styles.route';
import UserProductViewsRoute from './modules/views/user_views/user_product_views.route';
import InteriorsRoute from './modules/interiors/interiors.route';
import SavedInteriorsRoute from './modules/saved_interiors/saved_interiors.route';
import SavedModelsRoute from './modules/saved_models/saved_models.route';
import CommentsRoute from './modules/comments/comments.route';

const router = Router()

const authRoute = new AuthRoute()
const usersRoute = new UsersRoute()
const categoriesRoute = new CategoriesRoute()
const brandsRoute = new BrandsRoute()
const modelsRoute = new ModelsRoute()
const colorsRoute = new ColorsRoute()
const materialsRoute = new MaterialsRoute()
const costsRoute = new CostsRoute()
const stylesRoute = new StylesRoute()
const userProductViewsRoute = new UserProductViewsRoute()
const interiorsRoute = new InteriorsRoute()
const savedInteriorsRoute = new SavedInteriorsRoute()
const savedModelsRoute = new SavedModelsRoute()
const commentsRoute = new CommentsRoute()


router.use("/", authRoute.router)
router.use("/", usersRoute.router)
router.use("/", categoriesRoute.router)
router.use("/", brandsRoute.router)
router.use("/", modelsRoute.router)
router.use("/", colorsRoute.router)
router.use("/", materialsRoute.router)
router.use("/", costsRoute.router)
router.use("/", stylesRoute.router)
router.use("/", userProductViewsRoute.router)
router.use("/", interiorsRoute.router)
router.use("/", savedInteriorsRoute.router)
router.use("/", savedModelsRoute.router)
router.use("/", commentsRoute.router)


export default router