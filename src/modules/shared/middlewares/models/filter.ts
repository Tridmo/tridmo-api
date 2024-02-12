import { isEmpty } from "class-validator";
import { NextFunction, Request, Response } from "express";
import StyleService from "../../../styles/styles.service";
import CategoryService from "../../../categories/categories.service";
import ColorService from "../../../colors/colors.service";
import FormfactorService from "../../../formfactors/formfactors.service";


const modelsFilterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categories, colors, styles, formfactors } = req.query
        const categoriesService = new CategoryService()
        const stylesService = new StyleService()
        const colorsService = new ColorService()
        const formfactorsService = new FormfactorService()

        if (categories && !Array.isArray(categories) && !isEmpty(categories)) {
            const category = await categoriesService.findOne(Number(categories))
            if(category.parent_id) req.query.categories = [category.id];
            else {
              const _categories = []
              const categoriesData = await categoriesService.findChildren(category.id)
              for (let category of categoriesData) {
                  _categories.push(category.id)
              }
              req.query.categories = _categories
            }
        }else if (!categories){
            const _categories = []
            const categoriesData = await categoriesService.findAllChildren()
            for (let category of categoriesData) {
                _categories.push(category.id)
            }
            req.query.categories = _categories
        }else{
            req.query.categories = req.query.categories
        }

        if (colors && !Array.isArray(colors) && !isEmpty(colors)) {
            const _color: any = [Number(colors)]
            req.query.colors = _color
        }else if (!colors){
            const _colors = []
            const colorsData = await colorsService.findAll("")
            for (let color of colorsData) {
                _colors.push(color.id)
            }
            req.query.colors = _colors
        }else{
            req.query.colors = req.query.colors
        }

        if (styles && !Array.isArray(styles) && !isEmpty(styles)) {
            const _style: any = [Number(styles)]
            req.query.styles = _style
        }else if (!styles){
            const _styles = []
            const stylesData = await stylesService.findAll("")
            for (let style of stylesData) {
                _styles.push(style.id)
            }
            req.query.styles = _styles
        }else{
            req.query.styles = req.query.styles
        }
        
        next()
    } catch (error) {
        next(error)
    }
}

export default modelsFilterMiddleware;