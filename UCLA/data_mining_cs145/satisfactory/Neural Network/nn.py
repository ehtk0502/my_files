import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.decomposition import PCA
from sklearn.model_selection import cross_val_score
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn import metrics

# Features we're using
#HEADERS = ["attributes_Alcohol", "attributes_casual", "attributes_romantic", "attributes_intimate", "attributes_classy", 
#            "attributes_hipster", "attributes_touristy", "attributes_trendy", "attributes_upscale", "attributes_BestNights_M", 
#            "attributes_BestNights_Tu", "attributes_BestNights_W", "attributes_BestNights_Th", "attributes_BestNights_F",  
#            "attributes_BestNights_Sat", "attributes_BestNights_Sun", "attributes_BikeParking", "attributes_Caters", 
#            "attributes_HasTV", "attributes_OutdoorSeating", "attributes_RestaurantsTakeOut", "attributes_WiFi",
#            "attributes_stars", "attributes_NoiseLevel", "attributes_RestaurantsGoodForGroups", "is_open", "is_restaurant", 
#            "attributes_WheelchairAccessible", "attributes_RestaurantsPriceRange2", "attributes_RestaurantsReservations", 
#            "attributes_RestaurantsDelivery", "attributes_GoodForKids", "attributes_BusinessAcceptsCreditCards", 
#            "attributes_BusinessParking", "attributes_RestaurantsAttire", "review_count", "attributes_GoodForMeal",
#            "attributes_RestaurantsTableService", "average_stars"]

def nn_classifier(features, target):
    #clf = RandomForestClassifier()
    #clf.fit(features, target)
    #return clf
    reg = MLPClassifier(early_stopping=True, hidden_layer_sizes=(256,128,64,32,16,8), random_state=1, verbose=1, activation='relu', learning_rate_init=0.001, alpha=0.000001, solver='sgd')
    reg.fit(features,target)
    return reg

if __name__ == "__main__":
    print("Reading csv's...")
    data = pd.DataFrame
    final_test_x = pd.DataFrame
    data = pd.read_csv('train_data.csv', encoding='latin1')
    final_test_x = pd.read_csv('predict_data.csv', encoding='latin1')
   
    train_x = data[["average_stars", "attributes_Alcohol", "attributes_stars", "attributes_WiFi", "attributes_GoodForMeal"]]
    train_y = data['stars']
    predictData=  final_test_x[['average_stars', 'attributes_Alcohol', 'attributes_stars', 'attributes_WiFi', 'attributes_GoodForMeal']]
    
    print("Training model...")
    trained_model = nn_classifier(train_x, train_y)
  
    # predictions = trained_model.predict_proba(predictData)
    predictions = trained_model.predict_proba(predictData)
    for i in range(predictions.shape[1]):
        predictions[:,i] *= (i+1)
    
    predictions = np.sum(predictions, axis=1)

    print("Making csv...",)
    predictions = pd.DataFrame(predictions)
    predictions.to_csv('m_result_dec.csv')


