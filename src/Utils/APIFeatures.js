/*
this class represents some features for all api in project
that include
-Sort
-Search
-Paginations
*/

import { paginationFuncion } from "./pagination.js";

export class APIFeatures {
  constructor(query, mongooseQuery) {
    this.query = query; //date from query or params
    this.mongooseQuery = mongooseQuery; //model.find()
  }
  pagination({ page, size }) {
    const { limit, skip } = paginationFuncion({ page, size });

    this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);
    return this; //this means return all class (methods and variables)
  }

  sortFunction(sortBy) {
    if (!sortBy) {
      this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 });
      return this;
    }

    //type of sort is string so, i want to convert it to object
    //if front developer send value of sort= createdAt desc  or createdAt asc
    //i have to convert it to {createdAt:-1} {createdAt:1}

    console.log({ sortBy });
    //sort now is  "stock desc" need to convert to    => stock:-1

    const replacement = sortBy
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":");
    console.log({ replacement }); //'stock:-1'  need to convert to {stock:-1}

    const splited = replacement.split(":");
    console.log({ splited }); //['stock','-1']  need to convert stock to key and -1 to value

    const [key, value] = splited;
    console.log({ key, value });

    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value });
    return this;
  }

  searchFunction(search) {
    const searchQuery = {};
    if (search.name) searchQuery.name = { $regex: search.name, $options: "i" };
    if (search.title)
      searchQuery.title = { $regex: search.title, $options: "i" };
    if (search.slug) searchQuery.slug = { $regex: search.slug, $options: "i" };
    if (search.discount) searchQuery.discount = +search.discount;
    if (search.basePrice) searchQuery.basePrice = +search.basePrice;
    if (search.priceTo && !search.priceFrom)
      searchQuery.appliedPrice = { $lte: search.priceTo };
    if (search.priceFrom && !search.priceTo)
      searchQuery.appliedPrice = { $gte: search.priceFrom };
    if (search.priceFrom && search.priceTo)
      searchQuery.appliedPrice = {
        $lte: search.priceTo,
        $gte: search.priceFrom,
      };

    // console.log(searchQuery)
    this.mongooseQuery = this.mongooseQuery.find(searchQuery);
    return this;
  }
}

/*

export class APIFeatures{
    constructor(query,mongooseQuery){
        this.query=query
        this.mingooseQuery=mongooseQuery
    }


    pagination(){
        const{page,size}=this.query
        const{limit,skip}=paginationFunction({page,size})
        this.mongooseQuery=this.mongooseQuery.limit(limit).skip(skip)
        return this
    }

    sort(sort){
 const formula=sort.replace(/desc/g,-1).replace(/asc/g,1).replace(/ /g,':' )
 const [key,value]=formula.split(':')
 
 this.mongooseQuery.= this.mongooseQuery.sort({[key]:+value})
return this.mongooseQuery
    }
}















*/
