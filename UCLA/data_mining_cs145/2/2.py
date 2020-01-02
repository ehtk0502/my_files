import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

if __name__ == "__main__":
    x= np.array([[0.52,-1,1],[0.91,0.32,1],[-1.48,1.23,1],[0.01,1.44,1],[-0.46,-0.37,1],[0.41,2.04,1],[0.53,0.77,1],[-1.21,-1.1,1],[-0.39,0.96,1],[-0.96,0.08,1],[2.46,2.59,-1],[3.05,2.87,-1],[2.2,3.04,-1],[1.89,2.64,-1],[4.51,-0.52,-1],[3.06,1.3,-1],[3.16,-0.56,-1],[2.05,1.54,-1],[2.34,0.72,-1],[2.94,0.13,-1]])
    '''
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    
    for i in range(np.size(x,0)):
        xs = x[i][0]
        ys = x[i][1]
        zs = x[i][2]
        d= 'r'
        if(zs == -1):
            d = 'g'
            
        ax.scatter(xs,ys,zs, c= d, marker = '^')
       
    ax.set_xlabel('X1 Label')
    ax.set_ylabel('x2 Label')
    ax.set_zlabel('Y Label')
    
    zline, zline2 = np.meshgrid(range(-5,5),range(-5,5))
    fx = -1.3381*zline - 0.389 *zline2 + 2.342
    ax.plot_surface(zline, zline2,fx,alpha = 0.5)
    
    
    
    plt.show()
    '''
    
    xt = x.T
    
    plt.scatter(xt[0][xt[2]==1],xt[1][xt[2]==1], c = 'red')
    plt.scatter(xt[0][xt[2]==-1],xt[1][xt[2]==-1], c = 'blue')
    var = np.array([0, 3])
    plt.plot(var, -1.3381/0.389*var + 2.342/0.389, c = 'grey')
    
    plt.show()
    