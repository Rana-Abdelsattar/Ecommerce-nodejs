
import {scheduleJob} from 'node-schedule'
import Coupon from '../../DB/models/coupon.model.js'
import {DateTime} from 'luxon'
export function cronToChangeCouponStatus(){
    
    scheduleJob('*/5 * * * * *',async ()=>{
        console.log('hello from crons')
        const coupons=await Coupon.find({couponStatus:'valid'})
    
        for (const coupon of coupons) {
            // console.log({dateNow:DateTime.now(),
            // toDate:DateTime.fromISO(coupon.toDate)})
            if(DateTime.now() > DateTime.fromISO(coupon.toDate))
            {
                coupon.couponStatus='expired'
                
            }
            await coupon.save()
           
        }
    })
}