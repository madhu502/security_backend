const path = require('path')
const productModel = require('../model/productModel');


const createProduct = async (req, res) => {

    //check incoming data
    console.log(req.body)
    console.log(req.files)

    //Destructuring the body data(json)
    const { productName, productPrice, productCategory, productDescription } = req.body;

    //Validation
    if (!productName || !productPrice || !productCategory || !productDescription) {
        return res.status(400).json({
            "sucess": false,
            "message": "Enter all fields"
        })
    }

    //validate if there is image
    if (!req.files || !req.files.productImage) {
        return res.status(400).json({
            "sucess": false,
            "message": "Image not found!"
        })
    }
    const { productImage } = req.files;

    //upload image
    //1. Generate new image name (abc.png)->(21343-abc.png)
    const imageName = ` ${Date.now()}-${productImage.name}`

    //2. Make a upload path (/path/upload - diractory)
    const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`)

    //3. Move to that directory (await, try-catch)
    try {
        await productImage.mv(imageUploadPath)

        // save to data base 
        const newProduct = new productModel({
            productName: productName,
            productPrice: productPrice,
            productCategory: productCategory,
            productDescription: productDescription,
            productImage: imageName
        })
        const product = await newProduct.save()
        res.status(201).json({
            "success": true,
            "message": "Product Created Successfully",
            "data": product
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "Internal Server Error!",
            "error": error
        })

    }

}


// feach single product
const getSingleProduct = async (req, res) => {
    // get product if from url(params)
    const productId = req.params.id;
    // find 
    try {
        const product = await productModel.findById(productId)
        if (!product) {
            res.status(400).json({
                "success": false,
                "message": "Product Not Found"
            });
        }
        res.status(201).json({
            "success": true,
            "message": "Product Fetch",
            "product": product
        }

        );
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "Internal Server Error!",
            "error": error
        })

    }

}


// fetch all products
const getAllProducts = async (req, res) => {
    // try catch
    try {
        const allProducts = await productModel.find({})
        res.status(201).json({
            "success": true,
            "message": "Product fetched Successfully",
            "products": allProducts
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "Internal Server Error!",
            "error": error
        })
    }

}


const deleteProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.id)
        res.status(201).json({
            "success": true,
            "message": "Product delete Successfully"
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "Internal Server Error!",
            "error": error
        })

    }
}


const updateProduct = async (req, res) => {
    try {
        if (req.files && req.files.productImage) {
            //destructuring 
            const { productImage } = req.files;

            //upload image to / public/products folders
            //1. generate new image name( abc.png cha bhani  chnage hunu paryo 123-abc.png)
            const imageName = `${Date.now()}-${productImage.name}`;
            //2. make a upload path(/path/upload - directory huncha)
            const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`);

            //move to folder 
            await productImage.mv(imageUploadPath);

            //req.params (id), req.body (updated data: pp, pn =, pc, pd ), req.files (image)
            //add new field to req.body (product image -> name)
            req.body.productImage = imageName; // image uploaded (generated name)

            //if image is iploaded and req.body is assignmed 
            if (req.body.productImage) {
                //finding existing product
                const existingProduct = await productModel.findById(req.params.id);
                //searching the image in directory
                const oldImagePath = path.join(__dirname, `../public/products/${existingProduct.productImage}`);
                //delete old image from the file system 
                fs.unlinkSync(oldImagePath);
            }

        }

        //update the data
        const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body,);
        res.status(201).json({
            "success": true,
            "message": "Product updated successfully",
            "data": updatedProduct
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        })
    }
};

//Pagination
const paginationProducts = async (req, res) => {
    //result per page
    const pageNo = req.query.page || 1;
    //per page 
    const resultPerPage = req.query.result || 4;
    try {
        // find all product skip limit
        const products = await productModel.find({}).skip((pageNo - 1) * resultPerPage)
            .limit(resultPerPage)

        // if page 6 is requested ,result 0
        if (products.length == 0) {
            res.status(400).json({
                "success": false,
                "message": "No product found",
            })
        }
        //response
        res.status(201).json({
            success: true,
            message: "Product Fetched",
            products: products,
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "No Product Found",
        })
    }

}
const productReviewController = async (req, res) => {
    try {
        const { comment, rating } = req.body
        // find product
        const product = await productModel.findById(req.params.id)
        // check previous review
        const alreadyReviewed = product.review.find((r) => r.user.toString() === req.user.id.toString())
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "Product Already reviewed"
            })
        }
        // review object
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user.id
        }
        // passing review object
        product.review.push(review)
        // numberof review
        product.numReview = product.review.length
        product.rating = product.review.reduce((acc, item) => item.rating + acc, 0) / product.review.length

        // save
        await product.save()
        res.status(200).json({
            success: true,
            message: "Review Added"
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "message": "Error in Review comment Api",
        })

    }
};
// CREATE PRODUCT REVIEW AND COMMENT
const productReviewControllers = async (req, res) => {
    try {
        const { comment, rating } = req.body;
        // find product
        const product = await productModel.findById(req.params.id);
        // check previous review
        const alreadyReviewed = product.review.find(
            (r) => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).send({
                success: false,
                message: "Product Alredy Reviewed",
            });
        }
        // review object

        console.log(req.user.id)
        console.log(req.user)
        console.log(req.user.firstname)

        const review = {
            firstname: req.user.firstname,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };
        // passing review object to reviews array
        product.review.push(review);
        // number or reviews
        product.numReview = product.review.length;
        product.rating =
            product.review.reduce((acc, item) => item.rating + acc, 0) /
            product.review.length;
        // save
        await product.save();
        res.status(200).send({
            success: true,
            message: "Review Added!",
        });
    } catch (error) {
        // console.log(error);
        // cast error ||  OBJECT ID
        if (error.firstname === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid Id",
            });
        }
        res.status(500).send({
            success: false,
            message: "Error In Review Comment API",
            error,
        });
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct,
    paginationProducts,
    productReviewController,
    productReviewControllers
};


// module.exports = {
//     createProduct,
//     getAllProducts,
//     getSingleProduct,
//     deleteProduct,
//     updateProduct,
//     paginationProducts
// };

