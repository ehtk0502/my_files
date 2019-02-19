import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import mean_squared_error

# Features we're using
# HEADERS = ["attributes_Alcohol", "attributes_casual", "attributes_romantic", "attributes_intimate", "attributes_classy", 
#             "attributes_hipster", "attributes_touristy", "attributes_trendy", "attributes_upscale", "attributes_BestNights_M", 
#             "attributes_BestNights_Tu", "attributes_BestNights_W", "attributes_BestNights_Th", "attributes_BestNights_F",  
#             "attributes_BestNights_Sat", "attributes_BestNights_Sun", "attributes_BikeParking", "attributes_Caters", 
#             "attributes_HasTV", "attributes_OutdoorSeating", "attributes_RestaurantsTakeOut", "attributes_WiFi",
#             "attributes_stars", "attributes_NoiseLevel", "attributes_RestaurantsGoodForGroups", "is_open", "is_restaurant", 
#             "attributes_WheelchairAccessible", "attributes_RestaurantsPriceRange2", "attributes_RestaurantsReservations", 
#             "attributes_RestaurantsDelivery", "attributes_GoodForKids", "attributes_BusinessAcceptsCreditCards", 
#             "attributes_BusinessParking", "attributes_RestaurantsAttire", "review_count", "attributes_GoodForMeal",
#             "attributes_RestaurantsTableService", "average_stars"]
HEADERS = ['average_stars', 'attributes_Alcohol', 'attributes_stars', 'attributes_WiFi', 'attributes_GoodForMeal']

def rf_classifier(features, target):
    clf = RandomForestClassifier()
    clf.fit(features, target)
    return clf

if __name__ == "__main__":
    print("Reading csv's...")
    business = pd.read_csv('datasets/business_attributes.csv', encoding='latin1')
    users = pd.read_csv('datasets/users.csv', encoding='latin1')
    expected = pd.read_csv('datasets/validate_queries.csv', encoding='latin1')
    final_test = pd.read_csv('datasets/test_queries.csv', encoding='latin1')

    # users dataset also has a column called review_count, 
    # we want to take the columns we need here
    users = users[['average_stars', 'user_id']]

    print("Merging data...")
    # Training data
    traindata = pd.merge_ordered(business, expected, how='right', on='business_id')
    train_x = pd.merge_ordered(traindata, users, how='left', on='user_id')

    # Testing data (to submit)
    testdata = pd.merge(business, final_test, how='right', on='business_id')
    final_test_x = pd.merge(testdata, users, how='left', on='user_id')

    print("Filter data for testing and training")
    train_x.drop(columns=['business_id', 'user_id'], axis=1, inplace=True)
    
    # Un-comment if you want to check RMSE
    train_x, test_x, train_y, test_y = train_test_split(train_x[HEADERS], train_x['stars'], train_size=0.7)

    # Un-comment if you don't want to check RMSE
    # train_x, train_y = train_x[HEADERS], train_x['stars']

    final_test_x.drop(columns=['business_id', 'user_id'], axis=1, inplace=True)
    final_test_x = final_test_x[HEADERS]
    
    # Output the csvs
    train_x.to_csv('datasets/train_x.csv')
    train_y.to_csv('datasets/train_y.csv')
    final_test_x.to_csv('datasets/final_test_x.csv')

    # Un-comment if you want to check RMSE
    test_x.to_csv('datasets/test_x.csv')
    test_y.to_csv('datasets/test_y.csv')
    
    print("Training model...")
    trained_model = rf_classifier(train_x, train_y)

    # Print the feature ranking
    # print("Feature ranking:")
    # importances = trained_model.feature_importances_
    # std = np.std([tree.feature_importances_ for tree in trained_model.estimators_],
    #             axis=0)
    # indices = np.argsort(importances)[::-1]
    # for f in range(train_x.shape[1]):
    #     print("%d. feature %d (%f)" % (f + 1, indices[f], importances[indices[f]]))

    # Plot the feature importances of the forest
    # plt.figure()
    # plt.title("Feature importances")
    # plt.bar(range(train_x.shape[1]), importances[indices],
    #     color="r", yerr=std[indices], align="center")
    # plt.xticks(range(train_x.shape[1]), indices)
    # plt.xlim([-1, train_x.shape[1]])
    # plt.show()

    # Un-comment if you want to check RMSE
    print("Check accuracy...")
    test_predictions = trained_model.predict_proba(test_x)
    train_predictions = trained_model.predict_proba(train_x)

    # predict_proba provides probability that that row is classified as 1, 2, 3, 4, 5
    # We need to change this into a single decimal value for RMSE
    # Weigh the classification of that column by the probability
    #                                 *1   *2   *3   *4  *5
    # [ 0.4, 0.2, 0.3, 0.1, 0 ] => [ 0.4, 0.4, 0.9, 0.4, 0 ] => [ 2.1 ]
    for i in range(test_predictions.shape[1]):
        test_predictions[:,i] *= (i+1)
        train_predictions[:,i] *= (i+1)
    
    # [ 0.4, 0.4, 0.9, 0.4 ] => [ 2.1 ]
    test_predictions = np.sum(test_predictions, axis=1)
    train_predictions = np.sum(train_predictions, axis=1)

    print("Train RMSE: ", mean_squared_error(train_y, train_predictions))
    print("Test RMSE: ", mean_squared_error(test_y, test_predictions))
    # End un-comment if you want to check RMSE

    print("Making predictions...")
    predictions = trained_model.predict_proba(final_test_x)
    for i in range(predictions.shape[1]):
        predictions[:,i] *= (i+1)
    
    predictions = np.sum(predictions, axis=1)

    print("Making csv...")
    predictions = pd.DataFrame(predictions)
    predictions.to_csv('datasets/predictions.csv')
