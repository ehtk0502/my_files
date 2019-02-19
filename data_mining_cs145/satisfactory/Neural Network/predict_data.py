import csv
import pandas as pd
import numpy as np
import sys
import csv
import itertools

if __name__ == '__main__':
    
    business = pd.read_csv('business_attributes.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    user = pd.read_csv('users.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    testQuery = pd.read_csv('test_queries.csv', sep='\s*,\s*', header=0, encoding='ascii', engine='python')
    
    Header = ['attributes_Alcohol','attributes_casual','attributes_romantic','attributes_intimate','attributes_classy','attributes_hipster','attributes_touristy','attributes_trendy','attributes_upscale','attributes_BestNights_M','attributes_BestNights_Tu','attributes_BestNights_W','attributes_BestNights_Th','attributes_BestNights_F','attributes_BestNights_Sat','attributes_BestNights_Sun','attributes_BikeParking','attributes_Caters','attributes_HasTV',
    'attributes_OutdoorSeating','attributes_RestaurantsTakeOut','attributes_WiFi','attributes_stars','attributes_NoiseLevel','attributes_RestaurantsGoodForGroups','is_open','is_restaurant','attributes_WheelchairAccessible','attributes_RestaurantsPriceRange2','attributes_RestaurantsReservations','attributes_RestaurantsDelivery','attributes_GoodForKids','attributes_BusinessAcceptsCreditCards','attributes_BusinessParking','attributes_RestaurantsAttire','review_count','attributes_GoodForMeal','attributes_RestaurantsTableService','business_id']
    
    Features = ['attributes_Alcohol','attributes_casual','attributes_romantic','attributes_intimate','attributes_classy','attributes_hipster','attributes_touristy','attributes_trendy','attributes_upscale','attributes_BestNights_M','attributes_BestNights_Tu','attributes_BestNights_W','attributes_BestNights_Th','attributes_BestNights_F','attributes_BestNights_Sat','attributes_BestNights_Sun','attributes_BikeParking','attributes_Caters','attributes_HasTV',
    'attributes_OutdoorSeating','attributes_RestaurantsTakeOut','attributes_WiFi','attributes_stars','attributes_NoiseLevel','attributes_RestaurantsGoodForGroups','is_open','is_restaurant','attributes_WheelchairAccessible','attributes_RestaurantsPriceRange2','attributes_RestaurantsReservations','attributes_RestaurantsDelivery','attributes_GoodForKids','attributes_BusinessAcceptsCreditCards','attributes_BusinessParking','attributes_RestaurantsAttire','review_count','attributes_GoodForMeal','attributes_RestaurantsTableService','average_stars']
    
    idFromUser = user['user_id']
    idFromValidate = testQuery['user_id']
    avgStar = user['average_stars']
    bussId = business['business_id']
    bussIdValidate = testQuery['business_id']
    bussAttrArray = business.values
    
    m_array = []
    n = []
    avgAttStar = 0
    avgstars = 0
    num = 0
    ######################## validateQuery
    for i in idFromValidate:
        flag = False;
        for j, k in zip(idFromUser, avgStar):
            if(i == j):
                try:
                    avgstars += float(k)
                    m_array.append(k)
                    flag = True
                    break
                except ValueError:
                    m_array.append(None)
                    flag = True
                    break
                
        if(flag == False):
            m_array.append(None)
        num += 1
            
            
    for id in bussIdValidate:
        flag = False
        q = 0
        for j in bussId:
            if(id == j):
                avgAttStar += float(bussAttrArray[q][22])
                n.append(bussAttrArray[q])
                flag = True
                break
            q = q +1
        if(flag == False):
            n.append([None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None,None, None, None, None, None, None, None, None, None, None, None, None])
        
    avgAttStar = round(avgAttStar/num, 2)
    avgstars = round(avgstars/num, 2)
    
    num = 0
    for i, j in zip(m_array, n):
        if(j[1] == None):
            for k in range(0, 38):
                if(k == 22):
                    n[num][k] = avgAttStar
                else:
                    n[num][k] = 1
        
        if(i == None):
            m_array[num] = avgstars
        
        num += 1
    
    
    
    frame = pd.DataFrame({'average_stars':m_array})
    frame1 = pd.DataFrame(n, columns = Header)
    train_x = pd.concat([frame, frame1], join='outer', axis=1)        
    train_x = train_x[Features]
    train_x.to_csv('predict_data.csv')