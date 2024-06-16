
import QRCode from 'qrcode'

export async function qrCodeGeneration(data){
    
    // take parameter as string or array only 
    //if i have to enter data as object i have to concert it to string by json.stringify(data)
    // if i will sed it as array i have to recieve data in array when i call the function
    const qrCode=await QRCode.toDataURL(JSON.stringify(data),{errorCorrectionLevel:'H'}) 
   return qrCode
       
}