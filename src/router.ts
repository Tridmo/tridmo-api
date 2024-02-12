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
import FormfactorsRoute from './modules/formfactors/formfactors.route';
import UserProductViewsRoute from './modules/views/user_views/user_product_views.route';
import OrdersRoute from './modules/orders/orders.route';
import ProductsRoute from './modules/products/products.route';
import InteriorsRoute from './modules/interiors/interiors.route';
import TransactionsRoute from './modules/transactions/transactions.route';
import CollectionsRoute from './modules/collections/collections.route'

const router = Router()

const authRoute = new AuthRoute()
const usersRoute = new UsersRoute()
const categoriesRoute = new CategoriesRoute()
const brandsRoute = new BrandsRoute()
const modelsRoute = new ModelsRoute()
const productsRoute = new ProductsRoute()
const colorsRoute = new ColorsRoute()
const materialsRoute = new MaterialsRoute()
const costsRoute = new CostsRoute()
const stylesRoute = new StylesRoute()
const formfactorsRoute = new FormfactorsRoute()
const userProductViewsRoute = new UserProductViewsRoute()
const ordersRoute = new OrdersRoute()
const interiorsRoute = new InteriorsRoute()
const transactionsRoute = new TransactionsRoute()
const collectionRoute = new CollectionsRoute()


router.use("/", authRoute.router)
router.use("/", usersRoute.router)
router.use("/", categoriesRoute.router)
router.use("/", brandsRoute.router)
router.use("/", modelsRoute.router)
router.use("/", productsRoute.router)
router.use("/", colorsRoute.router)
router.use("/", materialsRoute.router)
router.use("/", costsRoute.router)
router.use("/", stylesRoute.router)
router.use("/", formfactorsRoute.router)
router.use("/", userProductViewsRoute.router)
router.use("/", ordersRoute.router)
router.use("/", interiorsRoute.router)
router.use("/", transactionsRoute.router)
router.use("/", collectionRoute.router)


export default router