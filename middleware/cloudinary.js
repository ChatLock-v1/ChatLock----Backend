import { v2 as cloudinary } from 'cloudinary'



cloudinary.config({
    cloud_name:process.env.CLOUDNAME,
    api_key:process.env.CLOUDAPI,
    api_secret:process.env.SECRETAPI
})

export default cloudinary