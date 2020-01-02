import csv
import pandas as pd
import numpy as np
import sys
import csv
import itertools

if __name__ == '__main__':

    Header = ['attributes_Alcohol','attributes_casual','attributes_romantic','attributes_intimate','attributes_classy','attributes_hipster','attributes_touristy','attributes_trendy','attributes_upscale','attributes_BestNights_M','attributes_BestNights_Tu','attributes_BestNights_W','attributes_BestNights_Th','attributes_BestNights_F','attributes_BestNights_Sat','attributes_BestNights_Sun','attributes_BikeParking','attributes_Caters','attributes_HasTV',
    'attributes_OutdoorSeating','attributes_RestaurantsTakeOut','attributes_WiFi','attributes_stars','attributes_NoiseLevel','attributes_RestaurantsGoodForGroups','is_open','is_restaurant','attributes_WheelchairAccessible','attributes_RestaurantsPriceRange2','attributes_RestaurantsReservations','attributes_RestaurantsDelivery','attributes_GoodForKids','attributes_BusinessAcceptsCreditCards','attributes_BusinessParking','attributes_RestaurantsAttire','review_count','attributes_GoodForMeal','attributes_RestaurantsTableService','business_id']
    
    Features = ['attributes_Alcohol','attributes_casual','attributes_romantic','attributes_intimate','attributes_classy','attributes_hipster','attributes_touristy','attributes_trendy','attributes_upscale','attributes_BestNights_M','attributes_BestNights_Tu','attributes_BestNights_W','attributes_BestNights_Th','attributes_BestNights_F','attributes_BestNights_Sat','attributes_BestNights_Sun','attributes_BikeParking','attributes_Caters','attributes_HasTV',
    'attributes_OutdoorSeating','attributes_RestaurantsTakeOut','attributes_WiFi','attributes_stars','attributes_NoiseLevel','attributes_RestaurantsGoodForGroups','is_open','is_restaurant','attributes_WheelchairAccessible','attributes_RestaurantsPriceRange2','attributes_RestaurantsReservations','attributes_RestaurantsDelivery','attributes_GoodForKids','attributes_BusinessAcceptsCreditCards','attributes_BusinessParking','attributes_RestaurantsAttire','review_count','attributes_GoodForMeal','attributes_RestaurantsTableService','average_stars', 'stars']
    
    business = pd.read_csv('business_attributes.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    user = pd.read_csv('users.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    testQuery = pd.read_csv('test_queries.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    trainReview = pd.read_csv('train_reviews.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    validate = pd.read_csv('validate_queries.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    
    idFromUser = user['user_id']
    idFromValidate = validate['user_id']
    avgStar = user['average_stars']
    
    bussId = business['business_id']
    bussIdValidate = validate['business_id']
    bussAttrArray = business.values
    
    ####### train set
    trainId = trainReview['user_id']
    trainBusId = trainReview['business_id']
    
    ######final test set
    #FtestId = testQuery['user_id']
    #FtestBusId = testQuery['business_id']
    
    
    m_array = []
    n = []
    ######################## validateQuery
    for i in idFromValidate:
        flag = False;
        for j, k in zip(idFromUser, avgStar):
            if(i == j):
                try:
                    m_val = float(k)
                    m_array.append(m_val)
                    flag = True
                    break
                except ValueError:
                    m_array.append(None)
                    flag = True
                    break

        if(flag == False):
            m_array.append(None)
            
    frame = pd.DataFrame({'average_stars':m_array})
            
    for id in bussIdValidate:
        flag = False
        q = 0
        for j in bussId:
            if(id == j):
                n.append(bussAttrArray[q])
                flag = True
                break
            q = q +1
        if(flag == False):
            n.append([None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None, None, None, None, None, None, None, None, None, None])
    frame1 = pd.DataFrame(n, columns = Header)
    
    ##########################
    m_array = []
    n = []
    
    for i in trainId:
        flag = False;
        for j, k in zip(idFromUser, avgStar):
            if(i == j):
                try:
                    m_val = float(k)
                    m_array.append(m_val)
                    flag = True
                    break
                except ValueError:
                    m_array.append(None)
                    flag = True
                    break

        if(flag == False):
            m_array.append(None)
            
    frame2 = pd.DataFrame({'average_stars':m_array})
            
    for id in trainBusId:
        flag = False
        q = 0
        for j in bussId:
            if(id == j):
                n.append(bussAttrArray[q])
                flag = True
                break
            q = q +1
        if(flag == False):
            n.append([None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None, None, None, None, None, None, None, None, None, None])
    
    frame3 = pd.DataFrame(n, columns = Header)
    
    ###########################
    
    train_x = pd.concat([frame, validate], join='outer', axis=1)        
    train_x = pd.concat([train_x, frame1], join='outer', axis=1)
    train_x = train_x[Features]
    
    train_x1 = pd.concat([frame2, trainReview], join='outer', axis=1)        
    train_x1 = pd.concat([train_x1, frame3], join='outer', axis=1)
    train_x1 = train_x1[Features]
    
    finalData = pd.concat([train_x1, train_x], join='outer', axis=0)
    finalData = finalData[finalData['average_stars'].notnull()]
    finalData = finalData[finalData['attributes_Alcohol'].notnull()]
    
    finalData.to_csv('train_data.csv')
            
            
            