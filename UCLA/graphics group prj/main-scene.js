window.Sphere = window.classes.Sphere =
class Sphere
{
    constructor (pos, rad) // pos should be an array of length 3
    {
        this.position = pos;
        this.radius = rad;
    }
}

window.Prism = window.classes.Prism =
class Prism
{
    constructor (center, xScale, yScale, zScale) // center should be an array of length 3
    {
        this.xMin = center[0] - xScale;
        this.xMax = center[0] + xScale;
        this.yMin = center[1] - yScale;
        this.yMax = center[1] + yScale;
        this.zMin = center[2] - zScale;
        this.zMax = center[2] + zScale;
    }
}


window.Bombshelter_Scene = window.classes.Bombshelter_Scene =
class Bombshelter_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 25,0,200 ), Vec.of( 25,0,201 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        //BORROWED FROM FREE CODE: BULLET
        const points = Vec.cast( [2.8,0,0], [1.8, 0, -0.2], [1.0,0,-0.4], [.8,0,-0.6], [1.0,0,-0.8], [2.4,0,-1.0], [3.2, 0, -2.0],
                        [3.99, 0, -6.9], [3.2,0,-10.0], [2.4,0,-11.0], [1.12,0,-11.8], [0.25,0,-12.0], [0, 0, -12.0] );
        
        
        //SHAPES
        const shapes = { 
                         torus: new Torus(15,15),
                         floor: new Square(),
                         wall: new Cube(),
                         window: new Square(),
                         door: new Cube(),
                         player_head: new Subdivision_Sphere(4),
                         player_body: new Cube(),
                         box: new Cube(),                         
                         fan: new Fan(5),
                         bulb: new Subdivision_Sphere(4),
                         barlight: new Cube(),
                         bombfuse: new BombFuse(20,20),
                         bomb: new Subdivision_Sphere(4),
                         bombneck: new Torus(20,20),
                         timer_bg: new Square(),
                         explosion: new Subdivision_Sphere(4),
                         particle: new Tetrahedron(false),
                         nuke: new Surface_Of_Revolution( 20, 20, points ),
                         nuke2: new Subdivision_Sphere(4),
                         rock: new (Subdivision_Sphere.prototype.make_flat_shaded_version()) ( 2 )
                       }
        this.submit_shapes( context, shapes );
                                     
        //MATERIALS
        this.materials =
          {                                
            //BOMB SHELTER MATERIALS
            floor:     context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient:1, texture: context.get_instance("assets/floor.jpg", true) } ),
            wall:      context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient:1, texture: context.get_instance("assets/wall.jpg", true)} ),
            door:      context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient:1, texture: context.get_instance("assets/door.jpg", true)} ),
            player:    context.get_instance( Phong_Shader ).material( Color.of(1,1,0,1), { ambient:.4, diffusivity: 0.2, specularity: 0.2  }),
            wood:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/wood.jpg", true)}),
            plastic:   context.get_instance( Phong_Shader ).material( Color.of( .2,.2,.2, 1 ), { ambient: .4, diffusivity: .4 } ),
            light_bulb:context.get_instance( Phong_Shader ).material( Color.of(1,1,1,1), ({ambient: 1})),
            bloodybox: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/blood.jpg", true)}),
            alien:     context.get_instance( Texture_Scroll_X ).material( Color.of(0, 0, 0, 0.7), {ambient: 1, texture: context.get_instance("assets/alien.png", true)}),
            window:    context.get_instance( Phong_Shader ).material( Color.of( 0.2,0.2,0.7,1 ), { ambient:1 } ),
            puddle:    context.get_instance( Phong_Shader ).material( Color.of(0, 0, 0, 1), {ambient: 1, texture: context.get_instance("assets/a.png", true)}),
            bombfuse:  context.get_instance( Phong_Shader ).material( Color.of(0.5, 0.5, 0, 1), {ambient: 1}),
            bomb:      context.get_instance( Phong_Shader ).material( Color.of(0.1, 0.1, 0.1, 1), {ambient: 1}),
            bombneck:  context.get_instance( Phong_Shader ).material( Color.of(0.5, 0.5, 0.5, 1), {ambient: 1}),
            robot:     context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1), { ambient:1, texture: context.get_instance("assets/alien.jpg", true)} ),
            robot1:    context.get_instance( Phong_Shader ).material( Color.of( 1,0.2,0.2,1 ), {ambient:1} ),
            robot2:    context.get_instance( Phong_Shader ).material( Color.of( 0.2,0.2,0.2,1 ), {ambient:1} ),
            timer_bg:  context.get_instance( Phong_Shader ).material( Color.of(1, 1, 1, 1), {ambient: 1}),
            explosion: context.get_instance( Texture_Scroll_X ).material( Color.of(0, 0, 0, 0.8), {ambient: 1, texture: context.get_instance("assets/flame.jpg", true)}),
            nuke:      context.get_instance( Phong_Shader).material( Color.of(0.2, 0.2, 0.2, 1), {ambient: 1, smoothness:800} ),          
            nuke2_flash_off:    context.get_instance( Phong_Shader ).material( Color.of(1,1,1,0.2), {ambient: 1}),
            nuke2_flash_on:     context.get_instance( Phong_Shader ).material( Color.of(1,0,0,1), {ambient: 1}),
            particle:  context.get_instance( Phong_Shader ).material( Color.of(0.1, 0.1, 0.1, 1), {ambient: 1}),
            zero:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/0.jpg", true)}),
            one:       context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/1.jpg", true)}),
            two:       context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/2.jpg", true)}),
            three:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/3.jpg", true)}),
            four:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/4.jpg", true)}),
            five:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/5.jpg", true)}),
            six:       context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/6.jpg", true)}),
            seven:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/7.jpg", true)}),
            eight:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/8.jpg", true)}),
            nine:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/9.jpg", true)}),
            colon:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/colon.jpg", true)}),
            escape:    context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/Escape.jpg", true)}),
            exp:       context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/ExplosionDeath.jpg", true)}),
            robDeath:  context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/RobotDeath.jpg", true)}),
            quit:      context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/quit.jpg", true)}),
            start:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/StartMenu.jpg", true)}),
            rock:     context.get_instance( Phong_Shader ).material( Color.of( 0.2,0.2,0.3,1 ), { ambient: 0.8, diffuse:0.6, specularity:0} ),
            nukesymbol: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/nukesymbol.png", true)}),
            desert:     context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/desert.jpg", true)}),
            missile:   context.get_instance( Phong_Shader).material( Color.of(29/255, 33/255, 13/255, 1), {ambient: 1} ),
            missile_flash_off:    context.get_instance( Phong_Shader ).material( Color.of(1,1,1,0.2), {ambient: 1}),
            missile_flash_on:     context.get_instance( Phong_Shader ).material( Color.of(100/255,100/255,0,1), {ambient: 1})
          }
          //s is the scaling factor for x and z dimensions
          //t is the scaling factor for the y dimension;
          this.s = 10;
          this.t = 5;
          this.game_start = false;
          this.reset = true;      // false during gameplay, true otherwise
          this.forward = false;
          this.backward = false;
          this.right = false;
          this.left = false;
          this.up = false;
          this.down = false;
          this.rotation_time = 0; // time for player rotation
          this.rotation_time_ud = 0; // time for player rotation
          this.player_direction = [0, 0.5, -1]; // direction that the player is facing
          this.player_move = [0, 0, 0]; // position of player wrt starting position
          this.player_pos = [ -0.5*this.s, 0, -1.5*this.s]; // position of player wrt world origin
          this.walk_time = 0; // for arm and leg position 

          //Nuke explosion time
          this.nuke_explosion_time = 0;
          
          // robot position
          this.robot_pos = [[20, 0, 0], [75, 0, 62.5], [-15, 0, 35], [0, 0, 40], [0, 0, 60], [20, 0, 80], [45, 0, 75]];
          this.robot_dir = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
          this.num_robots = 7;

          //BOMB INFO
          //Bomb thrown?
          this.bomb_thrown = false;
          //Bomb position
          this.bomb_pos = [0, 0, 0];
          //Bomb air times
          this.bomb_air_time = 0;
          //Bomb direction
          this.bomb_direction =[0, 0, 0];
          //Initial bomb direction
          this.initial_bomb_direction = [0, 0, 0];
          this.bomb_exploded = false;
          //Bomb final position
          this.bomb_final_pos = [0, 0, 0];

          //EXPLOSION INFO
          //Explosion detonated?
          this.explosion_detonated = false;
          //blast direction
          this.explosion_direction = [0, 0, 0];
          //blast position
          this.explosion_pos = [0, 0, 0];
          //Explosion time
          this.explosion_time = 0;

          //Particle Info
          this.particle_pos = [0, 0, 0];
          this.particle_air_time = 0;
          this.particle_direction = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
                                     [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
                                     [0, 0, 0], [0, 0, 0]];
          this.particle_initial_direction = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
                                             [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
                                             [0, 0, 0], [0, 0, 0]];
          //number of particles
          this.particle_num = 10;
          this.v = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          //particle size
          this.particle_size = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
                                     [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
                                     [0, 0, 0], [0, 0, 0]];

          this.first_person_mode = false; //first person?
          this.third_person_mode = false; //third person?
          this.start_time = 0; //track game start time
          this.game_length = 120;
          this.time_left = this.game_length //track time left in game
          this.minutes_left = this.game_length/60; //break down time left to minutes/seconds left
          this.seconds_left = this.game_length%60;
          this.display_timer = false; //toggle for timer display
          this.start_time_flag = false;

          this.wallheight = 10;


          this.lights = [];
          this.doors = [];
          this.intact_doors = [true,true,true,true,true,true,
                               true,true,true,true,true,true,true,
                               true,true,true,true,true,true,
                               true,true,true,true,true,true,true];
          this.walls = [];
          this.floor_ceil = [];
          this.boxes = [];
          this.player;
          this.bombs;
          this.robot_parts = [];
          this.exit;
                 //robot movement
          this.robot_move = [false, false, false, false, false, false, false];

          this.first_round = true; // helps display specific menu
          this.explodeDeath = false;
          this.robotDeath = false;
          this.quitting = false;
          this.escaped = false;
          this.ceiling = true;     // add ceiling if true, for debugging purposes
      
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      {   
          this.key_triggered_button( "start game",       [ "5" ], () => {
          this.game_start = true;
          if (this.reset)
          {
                this.start_time_flag = true;
          }
          this.reset = false;
          this.attached = () => this.first_person;
          this.first_person_mode = true; 
          this.third_person_mode = false;
          this.explodeDeath = false;
          this.robotDeath = false;
          this.quitting = false;
          this.escaped = false;
          } );
        this.key_triggered_button( "View floorplan",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "first person", [ "1" ], () => {this.attached = () => this.first_person; this.first_person_mode = true; this.third_person_mode = false;});
        this.key_triggered_button( "third person", [ "3" ], () => {this.attached = () => this.third_person; this.third_person_mode = true; this.first_person_mode = false;});
        this.new_line();
        this.key_triggered_button( "forward",       [ "i" ], () => this.forward = true, undefined, () => this.forward = false );
        this.key_triggered_button( "backward",      [ "k" ], () => this.backward = true, undefined, () => this.backward = false );
        this.new_line();
        this.key_triggered_button( "turn right",    [ "l" ], () => this.right = true, undefined, () => this.right = false );
        this.key_triggered_button( "turn left",     [ "j" ], () => this.left = true, undefined, () => this.left = false );
        this.new_line();
        this.key_triggered_button( "look up",     [ "u" ], () => this.up = true, undefined, () => this.up = false );
        this.key_triggered_button( "look down",     [ "n" ], () => this.down = true, undefined, () => this.down = false );

        this.new_line();
        this.key_triggered_button( "time remaining",     ["t"], () => this.display_timer = true, undefined, () => this.display_timer = false);

        //Button for throwing a bomb
        this.key_triggered_button( "throw bomb",     [ "b" ], () => {
        this.bomb_thrown = true; 
        this.bomb_air_time = 0;
        this.bomb_exploded = false;
        for(var x = 0; x < 3; x++)
        {
            this.bomb_pos[x] = this.player_pos[x];
            this.bomb_final_pos[x] = this.player_pos[x];
            if (x == 1)
            {
                this.bomb_pos[x] += 1;
                this.bomb_final_pos[x] += 1;
            }
            this.bomb_direction[x] = this.player_direction[x];
            this.initial_bomb_direction[x] = this.player_direction[x];
        } 
        });
        this.new_line();
        this.key_triggered_button( "quit",       [ "q" ], () => {this.game_start = false; this.quitting = true;} );
      }
    
     //DOORS FUNCTION
     draw_doors(graphics_state, s, t, door_width, door_height)
    {
        //Make a tiny thickness for the door cubes
        const ds = 0.001;
        let model_transform = Mat4.identity().times(Mat4.scale([s,t,s]));
        var door_count = 0;
        //Start door

        let model_transform_temp = Mat4.translation([-(door_width/2)*s,(door_height/2)*t,-s])
                                    .times(model_transform).times(Mat4.scale([(door_width)/2, door_height/2,ds]));
        if(this.intact_doors[door_count])
        {
            this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
            this.doors.push(new Prism([-(door_width/2)*s,(door_height/2)*t,-s], s*(door_width)/2, t*door_height/2,10*s*ds));
        }
        else
        {
            this.doors.push(new Prism([0,0,0], 0,0,0));
        }
        door_count++;


        //Bottom perimeter door
        if(this.intact_doors[door_count])
        {
             model_transform_temp = Mat4.translation([(3.5)*s,(door_height/2)*t,9*s])
            .times(model_transform).times(Mat4.scale([(door_width)/2,door_height/2,ds]));
            this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
            this.doors.push(new Prism([(3.5)*s,(door_height/2)*t,9*s], s*(door_width)/2, t*door_height/2,10*s*ds));
        }
        else
        {
            this.doors.push(new Prism([0,0,0], 0,0,0));
        }
        door_count++;

        //Exit door
        if(this.intact_doors[door_count])
        {
            model_transform_temp = Mat4.translation([(2.5)*s,(door_height/2)*t,(9+8)*s])
            .times(model_transform).times(Mat4.scale([(door_width)/2,door_height/2,ds]));
            this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
            this.doors.push(new Prism([(2.5)*s,(door_height/2)*t,(9+8)*s], s*(door_width)/2, t*door_height/2,10*s*ds));
            this.exit = new Prism([(2.5)*s,(door_height/2)*t,(9+8)*s], s*(door_width)/2, t*door_height/2,10*s*ds);
        }
        else
        {
            this.doors.push(new Prism([0,0,0], 0,0,0));
        }
        door_count++;


        //Left hallway door
        if(this.intact_doors[door_count])
        {
           model_transform_temp = Mat4.translation([-2*s,(door_height/2)*t,8*s])
           .times(model_transform).times(Mat4.scale([ds,door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
           this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
           this.doors.push(new Prism([-2*s,(door_height/2)*t,8*s], 10*s*ds,t*door_height/2,s*(door_width)/2)); 
        }
        else
        {
            this.doors.push(new Prism([0,0,0], 0,0,0));
        }
        door_count++;

        //Second from left hallway door

        if(this.intact_doors[door_count])
        {
             model_transform_temp = Mat4.translation([-1*s,(door_height/2)*t,0*s])
             .times(model_transform).times(Mat4.scale([ds,door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,-1,0)));
             this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
             this.doors.push(new Prism([-1*s,(door_height/2)*t,0*s], 10*s*ds,t*door_height/2,s*(door_width)/2));   
        }
        else
        {
            this.doors.push(new Prism([0,0,0], 0,0,0));
        }
            door_count++;
        //Next set of doors connecting all main doors
        for (var k = 0; k < 5; k++)
        {
            if (this.intact_doors[door_count])
            {
                  model_transform_temp = Mat4.translation([1*s,(door_height/2)*t,(2*k + 0)*s])
                  .times(model_transform).times(Mat4.scale([ds,door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
                  this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
                  this.doors.push(new Prism([1*s,(door_height/2)*t,(2*k + 0)*s], 10*s*ds,t*door_height/2,s*(door_width)/2));
            }
            else
            {
                 this.doors.push(new Prism([0,0,0], 0,0,0));
            }
            door_count++;
        }     
        //Draw the other z-direction doors of these rooms
        for (k = 1; k < 5; k = k + 3)
        {
              if (this.intact_doors[door_count])
              {
                  model_transform_temp = Mat4.translation([3*s,(door_height/2)*t,(2*k + 0)*s])
                  .times(model_transform).times(Mat4.scale([ds,door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
                  this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
                  this.doors.push(new Prism([3*s,(door_height/2)*t,(2*k + 0)*s], 10*s*ds,t*door_height/2,s*(door_width)/2));  
              }
              else
            {
                 this.doors.push(new Prism([0,0,0], 0,0,0));
            }
              door_count++;
        }
         //Draw the main rooms x-direction doors
        for(k = 0; k < 4; k++)
            for(var j = 0; j < 2; j++)
            {
                  if (this.intact_doors[door_count])
                  {
                       model_transform_temp = Mat4.translation([(0+2*j)*s,(door_height/2)*t,(2*k + 1)*s])
                       .times(model_transform).times(Mat4.scale([(door_width)/2,door_height/2,ds]))
                       this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
                       this.doors.push(new Prism([(0+2*j)*s,(door_height/2)*t,(2*k + 1)*s], s*(door_width)/2,t*door_height/2,10*s*ds));
                  }
                  else
                  {
                        this.doors.push(new Prism([0,0,0], 0,0,0));
                  }
                  door_count++;
            }
        //Draw the large storage room x axis
        for(k = 0; k < 2; k++)
            for(var j = 0; j < 2; j++)
            {
                  if (this.intact_doors[door_count])
                  {
                        model_transform_temp = Mat4.translation([(4.5+3*j)*s,(door_height/2)*t,(2.5*k + 4)*s])
                        .times(model_transform).times(Mat4.scale([(door_width)/2,door_height/2,ds]))
                        this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
                        this.doors.push(new Prism([(4.5+3*j)*s,(door_height/2)*t,(2.5*k + 4)*s], s*(door_width)/2,t*door_height/2,10*s*ds));
                  }
                  else
                  {
                        this.doors.push(new Prism([0,0,0], 0,0,0));
                  }
                  door_count++;

            }
            //Draw the other smaller storage rooms
            for (var k = 0; k < 2; k++)
            {
                  if (this.intact_doors[door_count])
                  {
                        model_transform_temp = Mat4.translation([6*s,(door_height/2)*t,(2.5*k + 5.25)*s])
                        .times(model_transform).times(Mat4.scale([ds,door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
                        this.shapes.door.draw(graphics_state, model_transform_temp, this.materials.door);
                        this.doors.push(new Prism([6*s,(door_height/2)*t,(2.5*k + 5.25)*s], 10*s*ds,t*door_height/2,s*(door_width)/2));    
                  }
                  else
                  {
                        this.doors.push(new Prism([0,0,0], 0,0,0));
                  }
                  door_count++;
            }     
    }

    //NEW WALLS FUNCTION
    draw_walls(graphics_state, s, t, door_width, door_height)
    {
        //Define a tiny value to scale the wall thickness by. 
        var ds = 0.001;
        //Define another tiny value for future purposes 

        let model_transform = Mat4.identity().times(Mat4.translation([0,t,0])).times(Mat4.scale([s,t,s]));

        //Draw the perimeter walls and door spaces
            //Upper perimeter minus start room
        let model_transform_temp = Mat4.translation([-(3+door_width)/2*s,0,-s]).times(model_transform).times(Mat4.scale([(3-door_width)/2,1,ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-(3+door_width)/2*s,t,-s], s*(3-door_width)/2,t,10*s*ds));


        model_transform_temp = Mat4.translation([-(door_width/2)*s,(door_height/2)*t,-s])
        .times(model_transform).times(Mat4.scale([(door_width)/2,(1 - door_height/2),ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-(door_width/2)*s,(door_height/2)*t+t,-s], s*(door_width)/2,t*(1 - door_height/2),10*s*ds));


        //model_transform_temp = Mat4.translation([4.5*s, 0, -s]).times(model_transform).times(Mat4.scale([9/2, 1, ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        
        //New code to accommodate the wall texture
        for (var z = 1; z < 5; z++)
        {
              model_transform_temp = Mat4.translation([(1.125*2*z -1.125)*s, 0, -s]).times(model_transform).times(Mat4.scale([1.125, 1, ds]));
              this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }

        this.walls.push(new Prism([4.5*s, t, -s], s*9/2, t, 10*s*ds));


            //Start room
        model_transform_temp = Mat4.translation([-0.5*s, 0, -2*s]).times(model_transform)
        .times(Mat4.scale([1/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.nukesymbol);
        this.walls.push(new Prism([-0.5*s, t, -2*s], s*1/2, t, 10*s*ds));

        model_transform_temp = Mat4.translation([0, 0, -1.5*s]).times(model_transform)
        .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([1/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.nukesymbol);
        this.walls.push(new Prism([0, t, -1.5*s], 10*s*ds, t, s*1/2));

        model_transform_temp = Mat4.translation([-s, 0, -1.5*s]).times(model_transform)
        .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([1/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.nukesymbol);
        this.walls.push(new Prism([-s, t, -1.5*s], 10*s*ds, t, s*1/2));

            //Right perimeter
        //model_transform_temp = Mat4.translation([9*s, 0, 4*s]).times(model_transform)
        //.times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([10/2, 1, ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        //Accommodation for wall texture
        for (z = 1; z < 5; z++)
        {
              model_transform_temp = Mat4.translation([9*s, 0, (z*2.5 - 2.25)*s]).times(model_transform)
              .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([1.25, 1, ds]));
              this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }
        this.walls.push(new Prism([9*s, t, 4*s], 10*s*ds, t, s*10/2));

            //Bottom minus exit
        //model_transform_temp = Mat4.translation([(3.5*2 + 5.5 + door_width/2)/2*s,0,9*s]).times(model_transform).times(Mat4.scale([(5.5-door_width/2)/2,1,ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([(3.5*2 + 5.5 + door_width/2)/2*s,t,9*s], s*(5.5-door_width/2)/2,t,10*s*ds));

        model_transform_temp = Mat4.translation([(3.5)*s,(door_height/2)*t,9*s])
        .times(model_transform).times(Mat4.scale([(door_width)/2,1 - door_height/2, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([(3.5)*s,(door_height/2)*t+t,9*s], s*(door_width)/2,t*(1 - door_height/2),10*s*ds));

        //model_transform_temp = Mat4.translation([(0.5-door_width/2)/2*s, 0, 9*s]).times(model_transform).times(Mat4.scale([(6.5-door_width/2)/2, 1, ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([(0.5-door_width/2)/2*s, t, 9*s], s*(6.5-door_width/2)/2,t,10*s*ds));

        //Accommodation for wall texture
        for(z = 1; z < 5; z++)
        {
              model_transform_temp = Mat4.translation([(3.5*2 + 2*z*1.325 - 1.125 + door_width/2)/2*s,0,9*s])
              .times(model_transform).times(Mat4.scale([(1.375 -door_width/8)/2,1,ds]));
              this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
              model_transform_temp = Mat4.translation([(3.5*2 - 1.575*2*z + 1.375 -door_width/2)/2*s, 0, 9*s])
              .times(model_transform).times(Mat4.scale([(1.625 - door_width/8)/2, 1, ds]));
              this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }

            //Exit hallway and exit
        //model_transform_temp = Mat4.translation([4*s, 0, (9+5)*s]).times(model_transform)
        //.times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([10/2, 1, ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([4*s, t, (9+5)*s], 10*s*ds, t, s*10/2));

        //Accommodation for wall texture
        for(z = 1; z < 5; z++)
        {
              model_transform_temp = Mat4.translation([4*s, 0, (9+(1.25*2*z - 1.25))*s]).times(model_transform)
              .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([1.25, 1, ds]));
              this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }


        //model_transform_temp = Mat4.translation([3*s, 0, (9+4.5)*s]).times(model_transform)
        //.times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([9/2, 1, ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([3*s, t, (9+4.5)*s], 10*s*ds, t, s*9/2));

        //Accommodation for wall texture
        for(z = 1; z < 5; z++)
        {
               model_transform_temp = Mat4.translation([3*s, 0, (9+1.125*z*2 - 1.125)*s]).times(model_transform)
               .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([1.125, 1, ds]));
               this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }

        model_transform_temp = Mat4.translation([3*s, 0, (9+10)*s]).times(model_transform)
        .times(Mat4.scale([2/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([3*s, t, (9+10)*s], s,t,10*s*ds));

        model_transform_temp = Mat4.translation([2*s, 0, (9+9)*s]).times(model_transform)
        .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([2/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([2*s, t, (9+9)*s], 10*s*ds,t,s));

           //EXIT DOOR
        model_transform_temp = Mat4.translation([(2.5*2 + 0.5 + door_width/2)/2*s,0,(9+8)*s])
        .times(model_transform).times(Mat4.scale([(0.5-door_width/2)/2,1,ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([(2.5*2 + 0.5 + door_width/2)/2*s,t,(9+8)*s], s*(0.5-door_width/2)/2,t,10*s*ds));

        model_transform_temp = Mat4.translation([(2.5)*s,(door_height/2)*t,(9+8)*s])
        .times(model_transform).times(Mat4.scale([(door_width)/2,1 - door_height/2,ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([(2.5)*s,(door_height/2)*t+t,(9+8)*s], s*(door_width)/2,t*(1 - door_height/2),10*s*ds));

        model_transform_temp = Mat4.translation([(2*2+0.5-door_width/2)/2*s, 0, (9+8)*s])
        .times(model_transform).times(Mat4.scale([(0.5-door_width/2)/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([(2*2+0.5-door_width/2)/2*s, t, (9+8)*s], s*(0.5-door_width/2)/2, t, 10*s*ds));


            //Left perimeter
       //model_transform_temp = Mat4.translation([-3*s, 0, 4*s]).times(model_transform)
        //.times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([10/2, 1, ds]));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-3*s, t, 4*s], 10*s*ds, t, 5*s));

        //Accommodation for wall texture
        for(z = 1; z < 5; z++)
        {
               model_transform_temp = Mat4.translation([-3*s, 0, (z*2.5 - 2.25)*s]).times(model_transform)
               .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([1.25, 1, ds]));
               this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }

        //Draw Left hallway
         //model_transform_temp = Mat4.translation([-2*s,0,(7 - door_width/2)/2*s])
        //.times(model_transform).times(Mat4.scale([ds,1,(9-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-2*s,t,(7 - door_width/2)/2*s], 10*s*ds,t,s*(9-door_width/2)/2));

        //Accommodation for wall texture
        for(z = 1; z < 5; z++)
        {
               model_transform_temp = Mat4.translation([-2*s,0,(2.2*2*z - 4 - door_width/2)/2*s])
               .times(model_transform).times(Mat4.scale([ds,1,(2.25-door_width/8)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
               this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }

        model_transform_temp = Mat4.translation([-2*s,(door_height/2)*t,8*s])
        .times(model_transform).times(Mat4.scale([ds,1 - door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-2*s,(door_height/2)*t,8*s], 10*s*ds,t*(1 - door_height/2),s*(door_width)/2));

        model_transform_temp = Mat4.translation([-2*s, 0, (8*2 + 1 + door_width/2)/2*s])
        .times(model_transform).times(Mat4.scale([ds, 1, (1-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-2*s, t, (8*2 + 1 + door_width/2)/2*s], 10*s*ds, t, s*(1-door_width/2)/2));


        //Draw Second-from-left hallway
        model_transform_temp = Mat4.translation([-1*s,0,(-1 - door_width/2)/2*s])
        .times(model_transform).times(Mat4.scale([ds,1,(1-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,-1,0)));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-1*s,t,(-1 - door_width/2)/2*s], 10*s*ds,t,s*(1-door_width/2)/2));            

        model_transform_temp = Mat4.translation([-1*s,(door_height/2)*t,0*s])
        .times(model_transform).times(Mat4.scale([ds,1 - door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,-1,0)));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-1*s,(door_height/2)*t+t,0*s], 10*s*ds,t*(1 - door_height/2),s*(door_width)/2));

        //model_transform_temp = Mat4.translation([-1*s, 0, (1*2 + 7 + door_width/2)/2*s])
        //.times(model_transform).times(Mat4.scale([ds, 1, (9-door_width/2)/2])).times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)));
        //this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([-1*s, t, (1*2 + 7 + door_width/2)/2*s], 10*s*ds, t, s*(9-door_width/2)/2));

        //Accommodation for wall texture
        for(z = 1; z < 5; z++)
        {
               model_transform_temp = Mat4.translation([-1*s,0,(1*2 + 2.2*2*z - 4 + door_width/2)/2*s])
               .times(model_transform).times(Mat4.scale([ds,1,(2.25-door_width/8)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
               this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        }

        //Draw next set of doors connecting all the main rooms
        for (var k = 0; k < 5; k++)
        {
            model_transform_temp = Mat4.translation([1*s,0,(2*2*k +-1 - door_width/2)/2*s])
            .times(model_transform).times(Mat4.scale([ds,1,(1-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
            this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
            this.walls.push(new Prism([1*s,t,(2*2*k +-1 - door_width/2)/2*s], 10*s*ds, t, s*(1-door_width/2)/2));

            model_transform_temp = Mat4.translation([1*s,(door_height/2)*t,(2*k + 0)*s])
            .times(model_transform).times(Mat4.scale([ds,1 - door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
            this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
            this.walls.push(new Prism([1*s,(door_height/2)*t+t,(2*k + 0)*s], 10*s*ds, t*(1 - door_height/2),s*(door_width)/2));

            model_transform_temp = Mat4.translation([1*s, 0, (2*2*k + 1 + door_width/2)/2*s])
            .times(model_transform).times(Mat4.scale([ds, 1, (1-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
            this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
            this.walls.push(new Prism([1*s, t, (2*2*k + 1 + door_width/2)/2*s], 10*s*ds, t, s*(1-door_width/2)/2));

        }     
        //Draw the other z-direction walls of these rooms
        for (k = 1; k < 5; k = k + 3)
        {
            model_transform_temp = Mat4.translation([3*s,0,(2*2*k +-1 - door_width/2)/2*s])
            .times(model_transform).times(Mat4.scale([ds,1,(1-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
            this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
            this.walls.push(new Prism([3*s,t,(2*2*k +-1 - door_width/2)/2*s], 10*s*ds, t, s*(1-door_width/2)/2));
                        
            model_transform_temp = Mat4.translation([3*s,(door_height/2)*t,(2*k + 0)*s])
            .times(model_transform).times(Mat4.scale([ds,1 - door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
            this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
            this.walls.push(new Prism([3*s,(door_height/2)*t+t,(2*k + 0)*s], 10*s*ds, t*(1 - door_height/2),s*(door_width)/2));
            
            model_transform_temp = Mat4.translation([3*s, 0, (2*2*k + 1 + door_width/2)/2*s])
            .times(model_transform).times(Mat4.scale([ds, 1, (1-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
            this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
            this.walls.push(new Prism([3*s, t, (2*2*k + 1 + door_width/2)/2*s], 10*s*ds, t, s*(1-door_width/2)/2));            
        }
         model_transform_temp = Mat4.translation([3*s, 0, 0*s]).times(model_transform)
        .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([2/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([3*s, t, 0*s], 10*s*ds, t, s));

         model_transform_temp = Mat4.translation([3*s, 0, 5*s]).times(model_transform)
        .times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0))).times(Mat4.scale([4/2, 1, ds]));
        this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
        this.walls.push(new Prism([3*s, t, 5*s], 10*s*ds, t, 2*s));

        //Draw the main rooms x-direction doors
        for(k = 0; k < 4; k++)
            for(var j = 0; j < 2; j++)
            {
                 model_transform_temp = Mat4.translation([(2*2*j +-1 - door_width/2)/2*s,0,(1+2*k)*s])
                .times(model_transform).times(Mat4.scale([(1-door_width/2)/2,1,ds]))
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([(2*2*j +-1 - door_width/2)/2*s,t,(1+2*k)*s], s*(1-door_width/2)/2,t,10*s*ds));

                model_transform_temp = Mat4.translation([(0+2*j)*s,(door_height/2)*t,(2*k + 1)*s])
                .times(model_transform).times(Mat4.scale([(door_width)/2,1 - door_height/2,ds]))
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([(0+2*j)*s,(door_height/2)*t+t,(2*k + 1)*s], s*(door_width)/2,t*(1 - door_height/2),10*s*ds));

                model_transform_temp = Mat4.translation([(2*2*j + 1 + door_width/2)/2*s, 0,(2*k+1)*s ])
                .times(model_transform).times(Mat4.scale([(1-door_width/2)/2, 1, ds]))
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([(2*2*j + 1 + door_width/2)/2*s, t,(2*k+1)*s ], s*(1-door_width/2)/2,t,10*s*ds));
            }
        //Draw the large storage room x axis
        for(k = 0; k < 2; k++)
            for(var j = 0; j < 2; j++)
            {
                model_transform_temp = Mat4.translation([(3*2*j + 7.5 - door_width/2)/2*s,0,(4+2.5*k)*s])
                .times(model_transform).times(Mat4.scale([(1.5-door_width/2)/2,1,ds]))
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([(3*2*j + 7.5 - door_width/2)/2*s,t,(4+2.5*k)*s], s*(1.5-door_width/2)/2,t,10*s*ds));

                model_transform_temp = Mat4.translation([(4.5+3*j)*s,(door_height/2)*t,(2.5*k + 4)*s])
                .times(model_transform).times(Mat4.scale([(door_width)/2,1 - door_height/2,ds]))
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([(4.5+3*j)*s,(door_height/2)*t+t,(2.5*k + 4)*s], s*(door_width)/2,t*(1 - door_height/2),10*s*ds));

                model_transform_temp = Mat4.translation([(3*2*j + 10.5 + door_width/2)/2*s, 0,(2.5*k+4)*s ])
                .times(model_transform).times(Mat4.scale([(1.5-door_width/2)/2, 1, ds]))
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([(3*2*j + 10.5 + door_width/2)/2*s, t,(2.5*k+4)*s ], s*(1.5-door_width/2)/2,t,10*s*ds));
            }
            //Draw the other smaller storage rooms
            for (var k = 0; k < 2; k++)
            {
                model_transform_temp = Mat4.translation([6*s,0,(2.5*2*k + 8 + 1.25 - door_width/2)/2*s])
                .times(model_transform).times(Mat4.scale([ds,1,(1.25-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([6*s,t,(2.5*2*k + 8 + 1.25 - door_width/2)/2*s], 10*s*ds,t,s*(1.25-door_width/2)/2));

                model_transform_temp = Mat4.translation([6*s,(door_height/2)*t,(2.5*k + 5.25)*s])
                .times(model_transform).times(Mat4.scale([ds,1 - door_height/2,(door_width)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([6*s,(door_height/2)*t+t,(2.5*k + 5.25)*s], 10*s*ds,t*(1 - door_height/2),s*(door_width)/2));

                model_transform_temp = Mat4.translation([6*s, 0, (2.5*2*k + 8 + 3.75 + door_width/2)/2*s])
                .times(model_transform).times(Mat4.scale([ds, 1, (1.25-door_width/2)/2])).times(Mat4.rotation( Math.PI/2, Vec.of(0,1,0)));
                this.shapes.wall.draw(graphics_state, model_transform_temp, this.materials.wall);
                this.walls.push(new Prism([6*s, t, (2.5*2*k + 8 + 3.75 + door_width/2)/2*s], 10*s*ds, t, s*(1.25-door_width/2)/2));
            }     
    }

    //FLOOR PLAN
    draw_floor(graphics_state, s, t) 
    {
       //scaling value for square size is s
      var a;
      if (this.ceiling)
      {
            a = 2;
      }
      else
      {
            a = 1;
      }
       //Define floor plan
      for (var c = 0; c < a; c++)
      {
                 //Main rooms
       let model_transform = Mat4.identity().times(Mat4.scale([s, 1, s]));
       let ceil = Mat4.translation([0, 2*t*c, 0]);
       model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
       
       for (var i = 0; i < 2; i++)
       {
         for (var k = 0; k < 5; k++)
         {
           model_transform = (Mat4.translation([ 2*s*i,  0, 2*s*k])).times(model_transform);
           this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
           this.floor_ceil.push(new Prism([ 2*s*i,  2*t*c, 2*s*k],s,s*.01,s));
           //this.draw_walls(graphics_state, model_transform, i, k, 4);
           model_transform = (Mat4.translation([ -2*s*i, 0, -2*s*k])).times(model_transform);
         }
       }

       
       //Start room
       model_transform = Mat4.identity().times(Mat4.translation([ -0.5*s, 0, -1.5*s])).times(Mat4.scale([0.5*s, 1, 0.5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));

       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([ -0.5*s, 2*t*c, -1.5*s],.5*s,s*.01,.5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);

       //Big armory/storage (even tanks if we're willing)
       model_transform = Mat4.identity().times(Mat4.translation([ 6*s, 0, 1.5*s])).times(Mat4.scale([3*s, 1, 2.5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));

       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([ 6*s, 2*t*c, 1.5*s],3*s,s*.01,2.5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);
       
       //Bunks? Or alien rooms?
       model_transform = Mat4.identity().times(Mat4.scale([1.5*s, 1, 1.25*s]));
       model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
       for (var i = 0; i < 2; i++)
       {
         for (var k = 0; k < 2; k++)
         {
           model_transform = (Mat4.translation([ 4.5*s + 3*s*i, 0, 5.25*s + 2.5*s*k])).times(model_transform);

           this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
           this.floor_ceil.push(new Prism([ 4.5*s + 3*s*i, 2*t*c, 5.25*s + 2.5*s*k],1.5*s,s*.01,1.25*s));
           //this.draw_walls(graphics_state, model_transform, i, k, 1);
           model_transform = Mat4.translation([ -4.5*s - 3*s*i, 0, -5.25*s - 2.5*s*k]).times(model_transform);
         }
       }
       
       //Long hall
       model_transform = Mat4.identity().times(Mat4.translation([ -1.5*s, 0, 4*s])).times(Mat4.scale([0.5*s, 1, 5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([ -1.5*s, 2*t*c, 4*s],.5*s,s*.01,5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);

       //Other Long hall
       model_transform = Mat4.identity().times(Mat4.translation([ -2.5*s, 0, 4*s])).times(Mat4.scale([0.5*s, 1, 5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));

       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([ -2.5*s, 2*t*c, 4*s],.5*s,s*.01,5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);

       //Exit hall
       model_transform = Mat4.identity().times(Mat4.translation([ 3.5*s, 0, 9*s + 5*s])).times(Mat4.scale([0.5*s, 1, 5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));

       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([  3.5*s, 2*t*c, 9*s + 5*s],.5*s,s*.01,5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);

       //Tricky doorways at hall end
       model_transform = Mat4.identity().times(Mat4.translation([ 2.5*s, 0, 9*s + 9.5*s])).times(Mat4.scale([0.5*s, 1, 0.5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));

       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([ 2.5*s, 2*t*c, 9*s + 9.5*s],.5*s,s*.01,.5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);
       
       model_transform = Mat4.identity().times(Mat4.translation([ 2.5*s, 0, 9*s + 8.5*s])).times(Mat4.scale([0.5*s, 1, 0.5*s])).times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));

       this.shapes.floor.draw(graphics_state, ceil.times(model_transform), this.materials.floor );
       this.floor_ceil.push(new Prism([ 2.5*s, 2*t*c, 9*s + 8.5*s],.5*s,s*.01,.5*s));
       //this.draw_walls(graphics_state, model_transform, -1, -1, 0);  
      }
    }
    draw_nuke(graphics_state,s,t,time)
     {
         const nuke_x = 0.05, nuke_y = 0.05, nuke_z = 0.05;

         //Define basic model transform. Be careful: this is scaled relative to the floor dimensions, not the wall height
         let model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         let model_transform_temp = Mat4.translation([(-0.7 - nuke_x - 0.01)*s,(nuke_y + 0.11)*s,(-1.2 + nuke_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([nuke_x, nuke_y , nuke_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.nuke);
         this.boxes.push(new Prism([(-0.7 - nuke_x - 0.01)*s,(nuke_y + 0.11)*s,(-1.2 + nuke_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         
         model_transform_temp = Mat4.translation([0, 0.0, -6]).times(model_transform_temp). times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp, this.materials.nuke2_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp, this.materials.nuke2_flash_on);
     }
     draw_missile_pack(graphics_state,s,t,time)
     {
         const missile_x = 0.008, missile_y = 0.008, missile_z = 0.032;

         //PACK 1
         //Define basic model transform. Be careful: this is scaled relative to the floor dimensions, not the wall height
         let model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));
         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)
            //In the first room outside of start
         let model_transform_temp = Mat4.translation([(-0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         
         let model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.5 - missile_x - 0.01 +0.5)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.5 - missile_x - 0.01 +1)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));   
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
            
         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
          this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.5 - missile_x - 0.01 +1)*s,(0.1 + missile_y + 0.11+0.5)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.5 - missile_x - 0.01 +0.5)*s,(0.1 + missile_y + 0.11 + 0.5)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));        
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11 + 0.5)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));       
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

      //PACK 2
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([( - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([( - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(1 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
          this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(1 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11 + 0.5)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11 + 0.5)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(- missile_x - 0.01)*s,(0.1 + missile_y + 0.11 + 0.5)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);


        //PACK 3
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([(0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(0.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(1 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(1.5 - missile_x - 0.01)*s,(0.1 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
          this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(1.5 - missile_x - 0.01)*s,(0.6 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(1 - missile_x - 0.01)*s,(0.6 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(0.5 - missile_x - 0.01)*s,(0.6 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s], s*missile_x, s*missile_y , s*missile_z));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);


         //PACK 4
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([(0.25 - missile_x - 0.01)*s,(0.3 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
          this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

        //PACK 5
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([(-0.25 - missile_x - 0.01)*s,(0.3 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
          this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         //PACK 6
         //Define basic model transform. Be careful: this is scaled relative to the floor dimensions, not the wall height
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([(-0.5 - missile_x - 0.01)*s,(0.5 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);


         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
          this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);




      //PACK 7
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([( - missile_x - 0.01)*s,(0.5 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);


        //PACK 8
         model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         model_transform_temp = Mat4.translation([(0.5 - missile_x - 0.01)*s,(0.5 + missile_y + 0.11)*s,(8.95 + missile_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([missile_x, missile_y, missile_z]));
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);

         model_transform_temp = Mat4.translation([0, 0.5, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
         
         model_transform_temp = Mat4.translation([-0.5, 0, 0]).times(model_transform_temp);
         this.shapes.nuke.draw(graphics_state, model_transform_temp, this.materials.missile);
         //this.boxes.push(new Prism([(-0.7-0.008 - missile_x - 0.01)*s,(missile_y + 0.11)*s,(-1.2 + missile_z - 0.01)*s], s*0.2, s*0.4 , s*0.4));
         model_transform_temp_blink = Mat4.translation([0, 0, -3.8]).times(model_transform_temp).times(Mat4.scale([0.5, 0.5, 0.5]));
         
         if(Math.floor(time) % 2)
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_off);
         else
            this.shapes.nuke2.draw(graphics_state, model_transform_temp_blink, this.materials.missile_flash_on);
     }


    draw_player(graphics_state, s, dt, size, time, context)
    {
      if(!this.display_timer)
      {
            if(this.up)
            {
              if(2*Math.PI*this.rotation_time_ud/4 < Math.PI/2)
                  this.rotation_time_ud += dt;
            }
            if(this.down)
            {
              if(2*Math.PI*this.rotation_time_ud/4 > -Math.PI/2)
                  this.rotation_time_ud -= dt;
            }

            if(this.right)
            {
              this.rotation_time -= dt;
            }
            if(this.left)
            {
              this.rotation_time += dt;
            }
            this.player_direction[0] = -Math.sin(2*Math.PI*this.rotation_time/4); // change direction of player
            this.player_direction[2] = -Math.cos(2*Math.PI*this.rotation_time/4); 

            if(this.forward)
            {
              this.player_move[0] += dt*this.player_direction[0]*6;
              this.player_move[2] += dt*this.player_direction[2]*6;
              this.player_pos[0] += dt*this.player_direction[0]*6;
              this.player_pos[2] += dt*this.player_direction[2]*6;
              this.walk_time += dt;
            }
            if(this.backward)
            {
              this.player_move[0] -= dt*this.player_direction[0]*6;
              this.player_move[2] -= dt*this.player_direction[2]*6;
              this.player_pos[0] -= dt*this.player_direction[0]*6;
              this.player_pos[2] -= dt*this.player_direction[2]*6;
              this.walk_time -= dt;
            }
      }

      let model_transform = Mat4.scale([.125*size,.125*size,.125*size]); // make head
      model_transform = Mat4.translation([0,.625*size,0]).times(model_transform); // move head up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move head to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.player = new Sphere(Mat4.translation(this.player_move).times(Mat4.translation([ -0.5*s, 0, -1.5*s]))
                            .times(Mat4.translation([0,.625*size,0])).times(Vec.of(0,0,0,1)), .2*size);
      
      for(var i = 0; i < this.doors.length; i++)  // check for collision with doors
      {
         if (this.intersect(this.player, this.doors[i]))
         {
            if(this.forward)
            {
              this.player_move[0] -= dt*this.player_direction[0]*6;
              this.player_move[2] -= dt*this.player_direction[2]*6;
              this.player_pos[0] -= dt*this.player_direction[0]*6;
              this.player_pos[2] -= dt*this.player_direction[2]*6;
              this.walk_time -= dt;
            }
            if(this.backward)
            {
              this.player_move[0] += dt*this.player_direction[0]*6;
              this.player_move[2] += dt*this.player_direction[2]*6;
              this.player_pos[0] += dt*this.player_direction[0]*6;
              this.player_pos[2] += dt*this.player_direction[2]*6;
              this.walk_time += dt;
            }
            break;
          }  
      }  

      for(var i = 0; i < this.walls.length; i++) // check for collision with walls
      {
         if (this.intersect(this.player, this.walls[i]))
         {
            if(this.forward)
            {
              this.player_move[0] -= dt*this.player_direction[0]*6;
              this.player_move[2] -= dt*this.player_direction[2]*6;
              this.player_pos[0] -= dt*this.player_direction[0]*6;
              this.player_pos[2] -= dt*this.player_direction[2]*6;
              this.walk_time -= dt;
            }
            if(this.backward)
            {
              this.player_move[0] += dt*this.player_direction[0]*6;
              this.player_move[2] += dt*this.player_direction[2]*6;
              this.player_pos[0] += dt*this.player_direction[0]*6;
              this.player_pos[2] += dt*this.player_direction[2]*6;
              this.walk_time += dt;
            }
            break;
          }  
      }

            for(var i = 0; i < this.boxes.length; i++) // check for collision with boxes
      {
         if (this.intersect(this.player, this.boxes[i]))
         {
            if(this.forward)
            {
              this.player_move[0] -= dt*this.player_direction[0]*6;
              this.player_move[2] -= dt*this.player_direction[2]*6;
              this.player_pos[0] -= dt*this.player_direction[0]*6;
              this.player_pos[2] -= dt*this.player_direction[2]*6;
              this.walk_time -= dt;
            }
            if(this.backward)
            {
              this.player_move[0] += dt*this.player_direction[0]*6;
              this.player_move[2] += dt*this.player_direction[2]*6;
              this.player_pos[0] += dt*this.player_direction[0]*6;
              this.player_pos[2] += dt*this.player_direction[2]*6;
              this.walk_time += dt;
            }
            break;
          }  
      }

      for(var i = 0; i < this.robot_parts.length; i++) // check for collision with robot_parts
      {
         if (this.intersect(this.player, this.robot_parts[i]))
         {
            this.game_start = false;
            this.robotDeath = true;
            break;
          }  
      }
      if (this.intersect(this.player, this.exit))
      {
          this.game_start = false;
          this.escaped = true;
      }

      model_transform = Mat4.scale([.125*size,.125*size,.125*size]); // make head
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time_ud/4, Vec.of(1,0,0)).times(model_transform); // make the player turn up down
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time/4, Vec.of(0,1,0)).times(model_transform); // make the player turn left right
      model_transform = Mat4.translation([0,.625*size,0]).times(model_transform); // move head up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move head to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.shapes.player_head.draw(graphics_state, model_transform, this.materials.player);
      this.first_person = model_transform.times(Mat4.translation([0,0, -1.75]));
      this.third_person = model_transform.times(Mat4.translation([0,0, 15]));

      model_transform = Mat4.scale([.025*size,.125*size,.025*size]); // make torso
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time/4, Vec.of(0,1,0)).times(model_transform); // make the player turn
      model_transform = Mat4.translation([0,.375*size,0]).times(model_transform); // move torso up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move torso to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.shapes.player_body.draw(graphics_state, model_transform, this.materials.player);

      //display timer if requested by player (move with player POV)
      if (this.display_timer)
      {
        this.draw_timer(graphics_state, model_transform, time, context);
      }


      model_transform = Mat4.scale([.025*size,.15*size,.025*size]); // make right leg
      model_transform = Mat4.translation([0.025*size,-.15*size,0]).times(model_transform);
      model_transform = Mat4.rotation(Math.PI/12, Vec.of(0,0,1)).times(model_transform);
      model_transform = Mat4.rotation(Math.PI/6*Math.sin(3*Math.PI*this.walk_time), Vec.of(1,0,0)).times(model_transform); // move leg while walking
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time/4, Vec.of(0,1,0)).times(model_transform); // make the player turn
      model_transform = Mat4.translation([0,.25*size,0]).times(model_transform); // move right leg up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move right leg to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.shapes.player_body.draw(graphics_state, model_transform, this.materials.player);
      
      model_transform = Mat4.scale([.025*size,.1445*size,.025*size]); // make right arm
      model_transform = Mat4.translation([0.025*size,-.1445*size,0]).times(model_transform);
      model_transform = Mat4.rotation(Math.PI/6, Vec.of(0,0,1)).times(model_transform);
      model_transform = Mat4.rotation(-Math.PI/6*Math.sin(3*Math.PI*this.walk_time), Vec.of(1,0,0)).times(model_transform); // move arm  while walking
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time/4, Vec.of(0,1,0)).times(model_transform); // make the player turn
      model_transform = Mat4.translation([0,.45*size,0]).times(model_transform); // move right arm up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move right arm to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.shapes.player_body.draw(graphics_state, model_transform, this.materials.player);

      model_transform = Mat4.scale([.025*size,.15*size,.025*size]); // make left leg
      model_transform = Mat4.translation([-0.025*size,-.15*size,0]).times(model_transform);
      model_transform = Mat4.rotation(-Math.PI/12, Vec.of(0,0,1)).times(model_transform);
      model_transform = Mat4.rotation(-Math.PI/6*Math.sin(3*Math.PI*this.walk_time), Vec.of(1,0,0)).times(model_transform); // move leg while walking
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time/4, Vec.of(0,1,0)).times(model_transform); // make the player turn
      model_transform = Mat4.translation([0,.25*size,0]).times(model_transform); // move left leg up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move left leg to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.shapes.player_body.draw(graphics_state, model_transform, this.materials.player);
      
      model_transform = Mat4.scale([.025*size,.1445*size,.025*size]); // make left arm
      model_transform = Mat4.translation([-0.025*size,-.1445*size,0]).times(model_transform);
      model_transform = Mat4.rotation(-Math.PI/6, Vec.of(0,0,1)).times(model_transform);
      model_transform = Mat4.rotation(Math.PI/6*Math.sin(3*Math.PI*this.walk_time), Vec.of(1,0,0)).times(model_transform); // move arm  while walking
      model_transform = Mat4.rotation(2*Math.PI*this.rotation_time/4, Vec.of(0,1,0)).times(model_transform); // make the player turn
      model_transform = Mat4.translation([0,.45*size,0]).times(model_transform); // move left arm up
      model_transform = Mat4.translation([ -0.5*s, 0, -1.5*s]).times(model_transform); // move left arm to initial position
      model_transform = Mat4.translation(this.player_move).times(model_transform); // move player to where user wants
      this.shapes.player_body.draw(graphics_state, model_transform, this.materials.player);

      if (typeof this.attached != 'undefined') // move camera to player
      {
        let desired = Mat4.translation([0, -1.5, 0]).times(Mat4.inverse(this.attached())); 
        graphics_state.camera_transform = desired; // .map((x,i) => Vec.from(graphics_state.camera_transform[i]).mix(x, .1));
      }   
    }
    
    draw_bloodybox(graphics_state, s){
        let model_transform = Mat4.identity().times(Mat4.scale([s/8, s/8, s/8]));
        model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
        model_transform = model_transform.times(Mat4.translation([-4.8, 6.9, -1]));
            
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([-2.1, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));
         
        model_transform = model_transform.times(Mat4.translation([0, 0, -2]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, 2, 2]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([13.8, 14, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, 0, -2]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([36, -5, 2]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, -2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));
        
        model_transform = model_transform.times(Mat4.translation([0, -2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, -2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([-2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([-2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([-2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, 2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, 2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));
        
        model_transform = model_transform.times(Mat4.translation([0, -2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([-2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, 0, -2]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox)
        

        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));


        model_transform = model_transform.times(Mat4.translation([2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([0, 2, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([-2, 0, 0]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));

        model_transform = model_transform.times(Mat4.translation([1, -1, -2]));
        this.shapes.box.draw(graphics_state, model_transform, this.materials.bloodybox);
        this.boxes.push(new Prism(model_transform.times(Vec.of(0,0,0,1)), s/8, s/8, s/8));
        
    }
    
     draw_robot(graphics_state, s, time, dt){        
        
        var angle = 0;
        var rotate = 0;

        if (this.time_left <= this.game_length - 30 && this.game_start)
        {
                this.robot_move = [true, true, true, true, true, true, true];
        }
         
        // robot moves when robot_move is true. You can use this to landlock them.

        //First robot
        if(this.robot_pos[0][0] < s + 2 || this.robot_pos[0][0] > 3*s - 2 
        || this.robot_pos[0][2] < -s + 2 || this.robot_pos[0][2] > s - 2)
        {
              this.robot_move[0] = false;
              if(!(this.player_pos[0] < s + 0.05 || this.player_pos[0] > 3*s - 0.05 
              || this.player_pos[2] < -s + 0.05 || this.player_pos[2] > s - 0.05))
              {
                    this.robot_move[0] = true;
              }
        }

        //Second robot
        if(this.robot_pos[1][0] < 6*s + 2 || this.robot_pos[1][0] > 9*s - 2 
        || this.robot_pos[1][2] < 4*s + 2 || this.robot_pos[1][2] > 6.5*s - 2)
        {
              this.robot_move[1] = false;
              if(!(this.player_pos[0] < 6*s + 0.05 || this.player_pos[0] > 9*s - 0.05 
              || this.player_pos[2] < 4*s + 0.05 || this.player_pos[2] > 6.5*s - 0.05))
              {
                    this.robot_move[1] = true;
              }
        }

        //Third robot
        if(this.robot_pos[2][0] < -2*s + 2 || this.robot_pos[2][0] > -1*s - 2 
        || this.robot_pos[2][2] < -1*s + 2 || this.robot_pos[2][2] > 9*s - 2)
        {
              this.robot_move[2] = false;
              if(!(this.player_pos[0] < -2*s + 0.05 || this.player_pos[0] > -1*s - 0.05 
              || this.player_pos[2] < -1*s + 0.05 || this.player_pos[2] > 9*s - 0.05))
              {
                    this.robot_move[2] = true;
              }
        }

        //Fourth robot
        if(this.robot_pos[3][0] < -1*s + 2 || this.robot_pos[3][0] > 1*s - 2 
        || this.robot_pos[3][2] < 3*s + 2 || this.robot_pos[3][2] > 5*s - 2)
        {
              this.robot_move[3] = false;
              if(!(this.player_pos[0] < -1*s + 0.05 || this.player_pos[0] > 1*s - 0.05 
              || this.player_pos[2] < 3*s + 0.05 || this.player_pos[2] > 5*s - 0.05))
              {
                    this.robot_move[3] = true;
              }
        }

        //Fifth robot
        if(this.robot_pos[4][0] < -1*s + 2 || this.robot_pos[4][0] > 1*s - 2 
        || this.robot_pos[4][2] < 5*s + 2 || this.robot_pos[4][2] > 7*s - 2)
        {
              this.robot_move[4] = false;
              if(!(this.player_pos[0] < -1*s + 0.05 || this.player_pos[0] > 1*s - 0.05 
              || this.player_pos[2] < 5*s + 0.05 || this.player_pos[2] > 7*s - 0.05))
              {
                    this.robot_move[4] = true;
              }
        }

        //Sixth robot
        if(this.robot_pos[5][0] < 1*s + 2 || this.robot_pos[5][0] > 3*s - 2 
        || this.robot_pos[5][2] < 7*s + 2 || this.robot_pos[5][2] > 9*s - 2)
        {
              this.robot_move[5] = false;
              if(!(this.player_pos[0] < 1*s + 0.05 || this.player_pos[0] > 3*s - 0.05 
              || this.player_pos[2] < 7*s + 0.05 || this.player_pos[2] > 9*s - 0.05))
              {
                    this.robot_move[5] = true;
              }
        }

        //Seventh robot
        if(this.robot_pos[6][0] < 3*s + 2 || this.robot_pos[6][0] > 6*s - 2 
        || this.robot_pos[6][2] < 6.5*s + 2 || this.robot_pos[6][2] > 9*s - 2)
        {
              this.robot_move[6] = false;
              if(!(this.player_pos[0] < 3*s + 0.05 || this.player_pos[0] > 6*s - 0.05 
              || this.player_pos[2] < 6.5*s + 0.05 || this.player_pos[2] > 9*s - 0.05))
              {
                    this.robot_move[6] = true;
              }
        }

        //Angle of rotation for the robot
        var robot_facing = [0, 0, 0, 0, 0, 0, 0];

        let model_transform = Mat4.identity();
        let pla = Mat4.identity();

        for (var rrr = 0; rrr < this.num_robots; rrr++)
        {
        
        if(this.robot_move[rrr]){
            //figure out and change the robot_dir toward the player.
            var x_dir = this.player_pos[0] - this.robot_pos[rrr][0];
            var z_dir = this.player_pos[2] - this.robot_pos[rrr][2];
            
            this.robot_dir[rrr][0] = x_dir / (Math.abs(x_dir) + Math.abs(z_dir));
            this.robot_dir[rrr][2] = z_dir / (Math.abs(x_dir) + Math.abs(z_dir));
            
            //Robot speed
            this.robot_pos[rrr][0] += dt * this.robot_dir[rrr][0] * 5;
            this.robot_pos[rrr][2] += dt * this.robot_dir[rrr][2] * 5;

            angle = 0.3* Math.sin(2*(time-this.start_time));
            rotate = time-this.start_time;

            robot_facing[rrr] = Math.acos(this.robot_dir[rrr][2]);
            //Need a special case for the other 180 degrees
            if(this.robot_dir[rrr][0] < 0)
            {
                  robot_facing[rrr] *= -1;
            }
        }
              
        
        //keep the x,z position of the robot
        //original position of the robot
      
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation([this.robot_pos[rrr][0], 6.5, this.robot_pos[rrr][2]]));
        
        //keep the x,z position of the robot
        //original position of the robot
        
        //Head
        pla = model_transform.times(Mat4.translation([0, -3.0, 0])).times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0))).times(Mat4.scale([s/15, s/15, s/15]));
        this.robot_parts.push(new Prism(pla.times(Vec.of(0,0,0,1)), s/15,s/15,s/15)); // for collision detection

        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);

        //Eye        
        pla = pla.times(Mat4.translation([0,0,1]));
        pla = pla.times(Mat4.scale([1/4,1/4,1/8]));
        
        if(this.robot_move[rrr]){
            this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        }
        else{
            this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);
        }
        
        pla = pla.times(Mat4.translation([0,0,1.5])).times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0))).times(Mat4.scale([1/2,1/2,1/2])).times(Mat4.scale([s/15, s/15, s/15]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);
        
        //Body
        pla = model_transform;
        pla = pla.times(Mat4.translation([0,-4.9,0])).times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0)));
        pla = pla.times(Mat4.scale([1.5, 2 ,1.5])).times(Mat4.scale([s/15, s/15, s/15]));
        this.robot_parts.push(new Prism(pla.times(Vec.of(0,0,0,1)), s/10,s/7.5,s/10)); // for collision detection
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        
        //Right Arm
        pla = model_transform;
        pla = pla.times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0))).times(Mat4.translation([-1.2,-4.5,0]));
        pla = pla.times(Mat4.translation([0, 0, -angle])).times(Mat4.scale([0.5,1, 0.8])).times(Mat4.scale([s/15, s/15, s/15]));
        
        this.robot_parts.push(new Prism(pla.times(Vec.of(0,0,0,1)), s/30,s/15,.8*s/15)); // for collision detection
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        
        //Left Arm
        pla = model_transform;
        pla = pla.times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0))).times(Mat4.translation([1.1,-4.5,0]));
        pla = pla.times(Mat4.translation([0, 0, angle])).times(Mat4.scale([0.5,1, 0.8])).times(Mat4.scale([s/15, s/15, s/15]));
        
        this.robot_parts.push(new Prism(pla.times(Vec.of(0,0,0,1)), s/30,s/15,.8*s/15)); // for collision detection
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        
        //Wheel
        pla = model_transform;
        pla = pla.times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0))).times(Mat4.translation([-1.1,-6,0]));
        
        pla = pla.times(Mat4.scale([0.5,0.5,0.5])).times(Mat4.scale([s/15, s/15, s/15]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        pla = pla.times(Mat4.scale([0.8,0.8,0.8]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
        pla = pla.times(Mat4.rotation( rotate , Vec.of( 0,0,1 ) )).times(Mat4.scale([s/15, s/15, s/15]));
        this.shapes.torus.draw( graphics_state, pla, this.materials.robot2);
        
        //Wheel
        pla = model_transform;
        pla = pla.times(Mat4.rotation(robot_facing[rrr], Vec.of(0, 1, 0))).times(Mat4.translation([1.2,-6,0]));
        
        pla = pla.times(Mat4.scale([0.5,0.5,0.5])).times(Mat4.scale([s/15, s/15, s/15]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        pla = pla.times(Mat4.scale([0.8,0.8,0.8]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
        pla = pla.times(Mat4.rotation( rotate , Vec.of( 0,0,1 ) )).times(Mat4.scale([s/15, s/15, s/15]));
        this.shapes.torus.draw( graphics_state, pla, this.materials.robot2);
        }

        //Broken robots        
        
        var lightFlicker =time % 4;
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation([3*s -1, 1, 4*s]));
        this.shapes.wall.draw( graphics_state, model_transform, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), 1, 1, 1));
        pla = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 0,-1,0 ) ));
        pla = pla.times(Mat4.translation([0,0,1]));
        pla = pla.times(Mat4.scale([1/4,1/4,1/8]));
        if(lightFlicker > 2){
            this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);
        }
        else{
            this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        }
        pla = pla.times(Mat4.scale([1/2,1/2,1/2]));
        pla = pla.times(Mat4.translation([0,0,1.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);

        pla = model_transform.times(Mat4.translation([-2,0, 5]));
        pla = pla.times(Mat4.scale([1,1, 2]));
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), 1, 1, 2));
        pla = pla.times(Mat4.translation([2.5,3,2 ]));
        pla = pla.times(Mat4.scale([0.5,4,0.5]));
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), 0.5, 4, 1));

        pla = model_transform.times(Mat4.translation([-1,-0.7, -3]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,0,-1 ) ));
        pla = pla.times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        pla = pla.times(Mat4.scale([0.8,0.8,0.8]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
        pla = pla.times(Mat4.rotation( rotate , Vec.of( 0,0,1 ) ));
        this.shapes.torus.draw( graphics_state, pla, this.materials.robot2);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), 0.8, 0.8, 0.8));
        
        model_transform = model_transform.times(Mat4.translation([2 , 0, 1.5*s]));
        model_transform = model_transform.times(Mat4.rotation( Math.PI, Vec.of( 0,-1,0 ) ));

        this.shapes.wall.draw( graphics_state, model_transform, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), 1, 1, 1));
        pla = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 0,-1,0 ) ));
        pla = pla.times(Mat4.translation([0,0,1]));
        pla = pla.times(Mat4.scale([1/4,1/4,1/8]));
        if(lightFlicker > 2){
            this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);
        }
        else{
            this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        }
        pla = pla.times(Mat4.scale([1/2,1/2,1/2]));
        pla = pla.times(Mat4.translation([0,0,1.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);

        pla = model_transform.times(Mat4.translation([-2,0, 5]));
        pla = pla.times(Mat4.scale([1,1, 2]));
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), 1, 1, 2));
        pla = pla.times(Mat4.translation([2.5,3,2 ]));
        pla = pla.times(Mat4.scale([0.5,4,0.5]));
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), 0.5, 4, 1));

        pla = model_transform.times(Mat4.translation([-1,-0.7, -3]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,0,-1 ) ));
        pla = pla.times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        pla = pla.times(Mat4.scale([0.8,0.8,0.8]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
        pla = pla.times(Mat4.rotation( rotate , Vec.of( 0,0,1 ) ));
        this.shapes.torus.draw( graphics_state, pla, this.materials.robot2);
          //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), 0.8, 0.8, 0.8));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7 and 4.5
 
      for(var i = 0; i <2; i++){
       for(var j =0; j < 6; j ++){
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale([s/15, s/15, s/15]));
        model_transform = model_transform.times(Mat4.translation([9.5*s +(7*j), 6.8, 13*s + 3 -(4.5*i)]));
        model_transform = model_transform.times(Mat4.rotation( Math.PI, Vec.of( 0 ,-1, 0 ) ));
        
        
      
        pla = model_transform;
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), s/15, s/15, s/15));
        pla = pla.times(Mat4.translation([0,0,1]));
        pla = pla.times(Mat4.scale([1/4,1/4,1/8]));
        
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);
        
        pla = pla.times(Mat4.scale([1/2,1/2,1/2]));
        pla = pla.times(Mat4.translation([0,0,1.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot);
        
        pla = model_transform;
        pla = pla.times(Mat4.translation([0,-3.5,0]));
        pla = pla.times(Mat4.scale([1.5, 2 ,1.5]));
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), s/10, s/7.5, s/10));
        
        
        pla = model_transform;
        pla = pla.times(Mat4.translation([-2.5,-2.5,0]));
        pla = pla.times(Mat4.scale([0.5,1, 0.8]));
        
        
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), s/30, s/15, s*0.8/15));
        
        
        pla = model_transform;
        pla = pla.times(Mat4.translation([2.5,-2.5,0]));
        pla = pla.times(Mat4.scale([0.5,1, 0.8]));
        
        this.shapes.wall.draw( graphics_state, pla, this.materials.robot);
        //Collision added
        this.boxes.push(new Prism(pla.times(Vec.of(0, 0, 0, 1)), s/30, s/15, s*0.8/15));
        
        pla = model_transform;
        pla = pla.times(Mat4.translation([-1.7,-5,0]));
        
        pla = pla.times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        pla = pla.times(Mat4.scale([0.8,0.8,0.8]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
        this.shapes.torus.draw( graphics_state, pla, this.materials.robot2);
        
        pla = model_transform;
        pla = pla.times(Mat4.translation([1.7,-5,0]));
        
        pla = pla.times(Mat4.scale([0.5,0.5,0.5]));
        this.shapes.bulb.draw( graphics_state, pla, this.materials.robot1);
        pla = pla.times(Mat4.scale([0.8,0.8,0.8]));
        pla = pla.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
        this.shapes.torus.draw( graphics_state, pla, this.materials.robot2);
       }
      }
        

     }

     draw_window(graphics_state, s)
     {
         let model_transform = Mat4.identity().times(Mat4.scale([s/5, s/5, s/5]));
         model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
         model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
         model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
         
         //first room
         let tempTrans; 
         tempTrans = model_transform.times(Mat4.translation([10, -2.5, -4.95]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, -0.1]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, -0.1]));
         tempTrans = tempTrans.times(Mat4.scale([0.7, 0.7, 0.7]));
         tempTrans = tempTrans.times(Mat4.rotation( Math.PI, Vec.of( 1,0,0 ) ));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.alien);
         tempTrans = tempTrans.times(Mat4.translation([.4, 0, -0.3]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.alien);
         
         //second
         tempTrans = model_transform.times(Mat4.translation([20, -2.5, -4.95]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, -0.1]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);

         //third
         tempTrans = model_transform.times(Mat4.translation([30, -2.5, -4.95]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, -0.1]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, -0.1]));
         tempTrans = tempTrans.times(Mat4.scale([0.7, 0.7, 0.7]));
         tempTrans = tempTrans.times(Mat4.rotation( Math.PI, Vec.of( 1,0,0 ) ));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.alien);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, -0.3]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.alien);

         //fourth
         tempTrans = model_transform.times(Mat4.translation([0, -2.5, 14.9]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);
         tempTrans = tempTrans.times(Mat4.translation([0, 0, 0.2]));
         this.shapes.window.draw(graphics_state, tempTrans, this.materials.window);


     }


     //Fans & bar lights
     draw_lights (graphics_state, time, t, s)
     {     
        // fan 1
        let model_transform = Mat4.identity();
        model_transform = Mat4.scale([.1,t/4,.1]);
        model_transform = Mat4.translation([-.5*s,1.75*t,-1.5*s]).times(model_transform);
        this.shapes.player_body.draw(graphics_state, model_transform, this.materials.plastic); // draw rod
        model_transform = Mat4.scale([2,2,2]);        
        model_transform = Mat4.rotation(time*Math.PI, Vec.of(0,1,0)).times(model_transform);
        model_transform = Mat4.translation([-.5*s, 1.5*t, -1.5*s]).times(model_transform);
        this.shapes.fan.draw(graphics_state, model_transform, this.materials.plastic);  // draw fan blades        
        model_transform = Mat4.scale([.25,.25,.25]);
        model_transform = Mat4.translation([-.5*s, 1.5*t, -1.5*s]).times(model_transform);
        this.shapes.bulb.draw(graphics_state, model_transform, this.materials.light_bulb); // draw light bulb
        
        
        // fan 2-11
        for (var i = 0; i < 2; i++)
        {
            for (var j = 0; j < 5; j++)
            {
                model_transform = Mat4.identity();
                model_transform = Mat4.scale([.1,t/4,.1]);
                model_transform = Mat4.translation([2*i*s,1.75*t, 2*j*s]).times(model_transform);
                this.shapes.player_body.draw(graphics_state, model_transform, this.materials.plastic); // draw rod
                model_transform = Mat4.scale([2,2,2]);        
                model_transform = Mat4.rotation(time*Math.PI, Vec.of(0,1,0)).times(model_transform);
                model_transform = Mat4.translation([2*i*s, 1.5*t, 2*j*s]).times(model_transform);
                this.shapes.fan.draw(graphics_state, model_transform, this.materials.plastic);  // draw fan blades        
                model_transform = Mat4.scale([.25,.25,.25]);
                model_transform = Mat4.translation([2*i*s, 1.5*t, 2*j*s]).times(model_transform);
                this.shapes.bulb.draw(graphics_state, model_transform, this.materials.light_bulb); // draw light bulb
               
            }
        }

        // fan 12-15
        for (var i = 0; i < 2; i++)
        {
            for (var j = 0; j < 2; j++)
            {
                model_transform = Mat4.identity();
                model_transform = Mat4.scale([.1,t/4,.1]);
                model_transform = Mat4.translation([4.5*s + 3*i*s,1.75*t, 5.25*s + 2.5*j*s]).times(model_transform);
                this.shapes.player_body.draw(graphics_state, model_transform, this.materials.plastic); // draw rod
                model_transform = Mat4.scale([2,2,2]);        
                model_transform = Mat4.rotation(time*Math.PI, Vec.of(0,1,0)).times(model_transform);
                model_transform = Mat4.translation([4.5*s + 3*i*s, 1.5*t,  5.25*s + 2.5*j*s]).times(model_transform);
                this.shapes.fan.draw(graphics_state, model_transform, this.materials.plastic);  // draw fan blades        
                model_transform = Mat4.scale([.25,.25,.25]);
                model_transform = Mat4.translation([4.5*s + 3*i*s, 1.5*t,  5.25*s + 2.5*j*s]).times(model_transform);
                this.shapes.bulb.draw(graphics_state, model_transform, this.materials.light_bulb); // draw light bulb
            }
        }

        // bar lights
        model_transform = Mat4.scale([.3,.3,2*s]);
        model_transform = Mat4.translation([4.5*s,2*t,1.5*s]).times(model_transform);
        this.shapes.barlight.draw(graphics_state, model_transform, this.materials.light_bulb);

        model_transform = Mat4.translation([3*s,0,0]).times(model_transform);
        this.shapes.barlight.draw(graphics_state, model_transform, this.materials.light_bulb);


     }

    //New function to draw wooden boxes
     draw_box(graphics_state,s,t)
     {
         //Define specific dimensions for various boxes
         const box1_x = 0.2;const box1_y = 0.2;const box1_z = 0.2;
         const box2_x = 0.5; const box2_y = 0.1; const box2_z = 0.1;
         const box3_x = 0.3; const box3_y = 0.15; const box3_z = 0.3;
         const box4_x = 0.15; const box4_y = 0.15; const box4_z = 0.15;

         //Define basic model transform. Be careful: this is scaled relative to the floor dimensions, not the wall height
         let model_transform = Mat4.identity().times(Mat4.scale([s, s, s]));

         //Make boxes... (the extra 0.01 bits are to prevent boxes from going through walls)

            //In the first room outside of start
         let model_transform_temp = Mat4.translation([(1 - box1_x - 0.01)*s,(box1_y + 0.01)*s,(1 - box1_z - 0.01)*s]).times(model_transform)
         .times(Mat4.scale([box1_x, box1_y , box1_z]));
         this.shapes.box.draw(graphics_state, model_transform_temp, this.materials.wood);
         this.boxes.push(new Prism([(1 - box1_x - 0.01)*s,(box1_y + 0.01)*s,(1 - box1_z - 0.01)*s], s*box1_x, s*box1_y , s*box1_z));

            //In room to right of first room
         model_transform_temp = Mat4.translation([(1 + box1_x + 0.01)*s,(box1_y + 0.01)*s,(1 + box1_z + 0.01)*s]).times(model_transform)
         .times(Mat4.scale([box1_x, box1_y , box1_z]));
         this.shapes.box.draw(graphics_state, model_transform_temp, this.materials.wood);
         this.boxes.push(new Prism([(1 + box1_x + 0.01)*s,(box1_y + 0.01)*s,(1 + box1_z + 0.01)*s], s*box1_x, s*box1_y , s*box1_z));

         //model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 0,1,0 ) ));
         
     }
     draw_puddle(graphics_state, s, time){
         let model_transform = Mat4.identity().times(Mat4.scale([s/5, s/5, s/5]));
         model_transform = model_transform.times(Mat4.rotation( Math.PI/2, Vec.of( 1,0,0 ) ));
         model_transform = model_transform.times(Mat4.translation([0, 0, -0.1]));
         this.shapes.floor.draw(graphics_state, model_transform, this.materials.puddle);
         
         var drop = time % 5;
         let temp;
         temp = model_transform.times(Mat4.translation([0, 0, -3.6+( 5* drop) ]));
         temp = temp.times(Mat4.scale([1/100, 1/100, 1/60]));
         this.shapes.bulb.draw(graphics_state, temp, this.materials.puddle);

         temp = model_transform.times(Mat4.translation([0, 2*s, 0]));
         this.shapes.floor.draw(graphics_state, temp, this.materials.puddle);
         temp = temp.times(Mat4.translation([0, 0, -3.6+( 5* drop) ]));
         temp = temp.times(Mat4.scale([1/100, 1/100, 1/60]));
         this.shapes.bulb.draw(graphics_state, temp, this.materials.puddle);

         temp = model_transform.times(Mat4.translation([s, 4*s, 0]));
         this.shapes.floor.draw(graphics_state, temp, this.materials.puddle);
         temp = temp.times(Mat4.translation([0, 0, -3.6+( 5* drop) ]));
         temp = temp.times(Mat4.scale([1/100, 1/100, 1/60]));
         this.shapes.bulb.draw(graphics_state, temp, this.materials.puddle);

         temp = model_transform.times(Mat4.translation([3.7*s, 3.9*s, 0]));
         this.shapes.floor.draw(graphics_state, temp, this.materials.puddle);
         temp = temp.times(Mat4.translation([0, 0, -3.6+( 5* drop) ]));
         temp = temp.times(Mat4.scale([1/100, 1/100, 1/60]));
         this.shapes.bulb.draw(graphics_state, temp, this.materials.puddle);

     }
     
    //Make the bomb move
     bomb_throw(graphics_state, dt)
     {
         //The throw is based on physics, neglecting drag force
            //Global bomb time
         this.bomb_air_time += dt;

         //Set a limit on the bomb travel time
         if(this.bomb_air_time > 1.5)
         {
             this.bomb_thrown = false;
         }
           //Define a throw velocity
         const v = 7;
           //Define an acceleration
         let a = [0, -3.217, 0];
         let pos_change = [0,0,0];
           //Update the bomb direction
           for(var x = 0; x < 3; x++)
           {
                this.bomb_direction[x] = this.initial_bomb_direction[x]*v + a[x]*this.bomb_air_time;
                //Change the position
                pos_change[x] = this.bomb_direction[x]*v*this.bomb_air_time + 0.5*a[x]*this.bomb_air_time*this.bomb_air_time;

                //Update bomb's final position
                this.bomb_final_pos[x] = this.bomb_pos[x] + pos_change[x];
           }
           
           //Make a translation matrix based on the change
           let pos_change_Mat = Mat4.translation(pos_change);

         //Return the bomb transformation matrix
         return pos_change_Mat;
     }
     
     //Make the bomb
     draw_bomb(graphics_state, s, t, dt)
     {
         //Define the location of the bomb
         let BombLocation = Mat4.translation(this.bomb_pos); 
      
         //Size and location of the bomb
         var bombScale = 0.1;
         let BombScaleMat = Mat4.scale([bombScale, bombScale, bombScale]);

         //Get the change in position of the bomb
         let BombChangePos = this.bomb_throw(graphics_state, dt);
         
         if (!this.bomb_exploded)
         {
               this.bomb = new Sphere(BombChangePos.times(BombLocation).times(Vec.of(0,0,0,1)), s*bombScale);
         }
         
       for(var i = 0; i < this.doors.length; i++)  // check for collision with doors
      {
         if (this.intersect(this.bomb, this.doors[i]))
         {
            this.bomb_exploded = true;
            this.explosion_reset();
            this.intact_doors[i] = false;
            this.bomb = new Sphere([0,0,0],0);
            break;
          }  
      }  

      for(var i = 0; i < this.walls.length; i++) // check for collision with walls
      {
         if (this.intersect(this.bomb, this.walls[i]))
         {
            this.bomb_exploded = true;
            this.explosion_reset();
            this.bomb = new Sphere([0,0,0],0);
            break;
          }  
      }

       for(var i = 0; i < this.boxes.length; i++) // check for collision with boxes
      {
         if (this.intersect(this.bomb, this.boxes[i]))
         {
            this.bomb_exploded = true;
            this.explosion_reset();
            this.bomb = new Sphere([0,0,0],0);
            break;
          }  
      }

        for(var i = 0; i < this.floor_ceil.length; i++) // check for collision with floor
      {
         if (this.intersect(this.bomb, this.floor_ceil[i]))
         {
            this.bomb_exploded = true;
            this.explosion_reset();
            this.bomb = new Sphere([0,0,0],0);
            break;
          }  
      }
        for(var i = 0; i < this.robot_parts.length; i++) // check for collision with robot_parts
      {
         if (this.intersect(this.bomb, this.robot_parts[i]))
         {
            //explosion();
            this.bomb_exploded = true;
            this.explosion_reset();
            this.bomb = new Sphere([0,0,0],0);
            break;
          }  
      }
         //Drawing the bomb

         if (!this.bomb_exploded)
         {
               let model_transform = (Mat4.identity()).times(Mat4.scale([s, s, s]));
         this.shapes.bomb.draw(graphics_state, BombChangePos.times(BombLocation).times(BombScaleMat).times(model_transform), this.materials.bomb);


         let model_transform_temp = Mat4.translation([0, (0.9)*s, 0]).times(model_transform)
         .times(Mat4.scale([0.2, 0.2, 0.2])).times(Mat4.rotation(0.5*Math.PI, Vec.of(1, 0, 0)));
         this.shapes.bombneck.draw(graphics_state, BombChangePos.times(BombLocation).times(BombScaleMat)
         .times(model_transform_temp), this.materials.bombneck);
         model_transform_temp = Mat4.translation([3*s*0.2, s, 0]).times(model_transform)
         .times(Mat4.scale([0.2, 0.2, 0.2])).times(Mat4.rotation(Math.PI, Vec.of(1, 0, 0)));
         this.shapes.bombfuse.draw(graphics_state, BombChangePos.times(BombLocation)
         .times(BombScaleMat).times(model_transform_temp), this.materials.bombfuse);
         }
         
     }

     //Prepping the bomb for explosion
     explosion_reset()
     {
           this.bomb_thrown = false;
           this.explosion_detonated = true;
           this.explosion_time = 0;
           this.particle_air_time = 0;
           for (var k = 0; k < 3; k++)
           {
                this.explosion_direction[k] = this.bomb_direction[k]; 
                this.explosion_pos[k] = this.bomb_final_pos[k]; 
                this.particle_pos[k] = this.bomb_final_pos[k];
           }
           //Random particle velocities
           for (var r = 0; r < this.particle_num; r++)
           {
                this.v[r] = Math.random()*4 + 3; 
                for (var j = 0; j < 3; j++)
                {
                      this.particle_initial_direction[r][j] = (Math.random() - Math.random())*(1)*this.bomb_direction[j];
                      this.particle_direction[r][j] = this.particle_initial_direction[r][j];
                      this.particle_size[r][j] = Math.random()*0.05;
                }
           }
     }

     //Exploding the bomb
     explosion(graphics_state, dt)
     {
           //Set a limit to the explosion
           if (this.explosion_time > 1)
           {
                 this.explosion_detonated = false;
           }
           //Set an explosion timer
           this.explosion_time += dt;
           //Create an equation for the explosion to be drawn by
           let explosion_transform = Mat4.translation(this.explosion_pos)
           .times(Mat4.scale([(0.1 + this.explosion_time)*this.s, (0.1 + this.explosion_time)*this.s, (0.1 + this.explosion_time)*this.s]));
           //Draw the explosion
           this.shapes.explosion.draw(graphics_state, explosion_transform, this.materials.explosion);

     }

     //Exploding the particles
     particle_explosion(graphics_state, dt)
     {
           //Define the location of the particle
         let ParticleLocation = Mat4.translation(this.particle_pos);
         

         //Get the change in position of the particle
         let ChangePos = this.particle_throw(graphics_state, dt);
         let ChangePos_mat = Mat4.identity();

         let model_transform = (Mat4.identity()).times(Mat4.scale([this.s, this.s, this.s]));

         //Drawing the particle
         for (var w = 0; w < 10; w++)
         {
             ChangePos_mat = Mat4.translation(ChangePos[w]);
              //Size
             let ParticleScaleMat = Mat4.scale(this.particle_size[w]);
             this.shapes.particle.draw(graphics_state, ChangePos_mat.times(ParticleLocation).times(ParticleScaleMat).times(model_transform), this.materials.particle);
         }
         
     }

     //Make the particle move
     particle_throw(graphics_state, dt)
     {
         //Create an equation for the particles to be drawn
         //The throw is based on physics, neglecting drag force
            //Global particle time
         this.particle_air_time += dt;

         //Set a limit on the bomb travel time
         if(this.particle_air_time > 1.0)
         {
             this.explosion_detonated = false;
         }
         
           //Define an acceleration
         let a = [0, -3.217, 0];
         let pos_change = [[0,0,0], [0,0,0], [0,0,0], [0,0,0],
                           [0,0,0], [0,0,0], [0,0,0], [0,0,0],
                           [0,0,0], [0,0,0]];
           //Update the bomb direction
           for (var w = 0; w < this.particle_num; w++)
           {
                 for(var x = 0; x < 3; x++)
                 {
                      this.particle_direction[w][x] = this.particle_initial_direction[w][x]*this.v[w] + a[x]*this.particle_air_time;  
                      //Change the position
                      pos_change[w][x] = this.particle_direction[w][x]*this.v[w]*this.particle_air_time + 0.5*a[x]*this.particle_air_time*this.particle_air_time;
                 }
           }
             
           
         //Return the bomb transformation matrix
         return pos_change;
     }

     make_lights (graphics_state) // only light up lights close to player
     {
         var rad = 2*this.s;

         let light_pos = [[-.5*this.s, 1.5*this.t, -1.5*this.s],
                         [0, 1.5*this.t, 0],
                         [0, 1.5*this.t, 2*this.s], 
                         [0, 1.5*this.t, 4*this.s],
                         [0, 1.5*this.t, 6*this.s],
                         [0, 1.5*this.t, 8*this.s],
                         [2*this.s, 1.5*this.t, 0],
                         [2*this.s, 1.5*this.t, 2*this.s],
                         [2*this.s, 1.5*this.t, 4*this.s],
                         [2*this.s, 1.5*this.t, 6*this.s],
                         [2*this.s, 1.5*this.t, 8*this.s],
                         [4.5*this.s, 1.5*this.t, 5.25*this.s],
                         [4.5*this.s, 1.5*this.t, 7.75*this.s],
                         [7.5*this.s, 1.5*this.t, 5.25*this.s],
                         [7.5*this.s, 1.5*this.t, 7.75*this.s],
                         [4.5*this.s,2*this.t,0],
                         [7.5*this.s,2*this.t,0],
                         [4.5*this.s,2*this.t,1.5*this.s],
                         [7.5*this.s,2*this.t,1.5*this.s],
                         [4.5*this.s,2*this.t,3*this.s],
                         [7.5*this.s,2*this.t,3*this.s]];

          for (var i = 0; i < light_pos.length; i++)
          {
              if (Math.pow((this.player_pos[0] - light_pos[i][0]), 2) + Math.pow((this.player_pos[2] - light_pos[i][2]), 2) < rad*rad)
              {
                this.lights.push(new Light(Vec.of(light_pos[i][0], light_pos[i][1], light_pos[i][2], 1), Color.of(1, 1, 1, 1), 1000));
              }
          }
      }
      
    draw_rock(graphics_state, s){

           let model_transform = Mat4.identity().times(Mat4.scale([s/10, s/10, s/10]));
           model_transform = model_transform.times(Mat4.translation([8*s, 1, 0.7]));
           for(var i = 0; i < 7; i ++){
            for(var j = 0; j < 7; j++){
                 model_transform = model_transform.times(Mat4.translation([1.5*j, 0, -1.6*i]));
                 this.shapes.rock.draw(graphics_state, model_transform, this.materials.rock);
                 //Collision detection
                 this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), s/10, s/10, s/10));
                 model_transform = model_transform.times(Mat4.translation([-1.5*j, 0, +1.6*i]));

            }      
           }
           for(var k = 0; k < 7; k ++){
           model_transform = model_transform.times(Mat4.scale([1/1.2, 1/1.2, 1/1.2]));
           model_transform = model_transform.times(Mat4.translation([1.7, 2, -1.7]));
           for(var i = 0; i < 7; i ++){
            for(var j = 0; j < 7; j++){
                 model_transform = model_transform.times(Mat4.translation([1.5*j, 0, -1.6*i]));
                 this.shapes.rock.draw(graphics_state, model_transform, this.materials.rock);
                 //Collision detection
                 this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), s/10, s/10, s/10));
                 model_transform = model_transform.times(Mat4.translation([-1.5*j, 0, +1.6*i]));

            }      
           }
           }
           
           model_transform = Mat4.identity().times(Mat4.scale([s/7, s/7, s/7]));
           model_transform = model_transform.times(Mat4.translation([5.2*s, 1, 0]));
           this.shapes.rock.draw(graphics_state, model_transform, this.materials.rock);
           //Collision detection
           this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), s/7, s/7, s/7));
           model_transform = model_transform.times(Mat4.translation([2, 0, -4]));
           this.shapes.rock.draw(graphics_state, model_transform, this.materials.rock);
           //Collision detection
           this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), s/7, s/7, s/7));
           
           model_transform = model_transform.times(Mat4.translation([5, 0.5, 8]));
           model_transform = model_transform.times(Mat4.scale([1.5, 1.5, 1.5]));
           this.shapes.rock.draw(graphics_state, model_transform, this.materials.rock);
           //Collision detection
           this.boxes.push(new Prism(model_transform.times(Vec.of(0, 0, 0, 1)), s/7, s/7, s/7));
     }

      //TIMER
    get_start_time(time)
    {
        this.start_time = time;
    }

    get_time_left(time)
    {
          this.time_left = this.game_length - (time - this.start_time); //seconds          
     }
    //draw_timer(graphics_state, model_transform, time, start_time)
    draw_timer(graphics_state, model_transform, time, context)
    {
        this.minutes_left = Math.floor((this.time_left - (this.time_left % 60))/60);
        this.seconds_left = Math.floor(this.time_left % 60);
        let timer_string = this.minutes_left.toString() + ":" + this.seconds_left.toString();
        let timer_transform = Mat4.identity();

        if (this.first_person_mode)
        {
        timer_transform = model_transform.times(Mat4.translation([0.33, 2.078+1.5, -10]))
                                       //  .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([0.0155*5, 0.0155, 0.05]));
        }

        if (this.third_person_mode)
        {
        timer_transform = model_transform.times(Mat4.translation([25, 7+1.5, -5]))
                                        // .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([1*5, 1, 2]));
        }        
 
         if(this.minutes_left == 0)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.zero);
         }
         else if(this.minutes_left == 1)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.one);
         }
         else if(this.minutes_left == 2)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.two);
         }
         else if(this.minutes_left == 3)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.three);
         }
         else if(this.minutes_left == 4)
         {
              this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.four);
         }
         else if(this.minutes_left == 5)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.five);
         }
         else if(this.minutes_left == 6)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.six);
         }                        
         else if(this.minutes_left == 7)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.seven);
         }
         else if(this.minutes_left == 8)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.eight);
         }
         else if(this.minutes_left == 9)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.nine);
         }
         if (this.first_person_mode)
        {
            timer_transform = model_transform.times(Mat4.translation([0.45, 2.078+1.5, -10]))
                                       //  .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([0.0155*5, 0.0155, 0.05]));
        }
        if (this.third_person_mode)
        {
            timer_transform = model_transform.times(Mat4.translation([32, 7+1.5, -5]))
                                       //  .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([1*5, 1, 2]));
        }
        this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.colon);
        if (this.first_person_mode)
        {
            timer_transform = model_transform.times(Mat4.translation([0.57, 2.078+1.5, -10]))
                                       //  .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([0.0155*5, 0.0155, 0.05]));
        }
        if (this.third_person_mode)
        {
            timer_transform = model_transform.times(Mat4.translation([40, 7+1.5, -5]))
                                      //   .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([1*5, 1, 2]));
        }        
         if(Math.floor(this.seconds_left/10) == 0)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.zero);
         }
         else if(Math.floor(this.seconds_left/10) == 1)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.one);
         }
         else if(Math.floor(this.seconds_left/10) == 2)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.two);
         }
         else if(Math.floor(this.seconds_left/10) == 3)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.three);
         }
         else if(Math.floor(this.seconds_left/10) == 4)
         {
              this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.four);
         }
         else if(Math.floor(this.seconds_left/10) == 5)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.five);
         }
         else if(Math.floor(this.seconds_left/10) == 6)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.six);
         }                        
         else if(Math.floor(this.seconds_left/10) == 7)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.seven);
         }
         else if(Math.floor(this.seconds_left/10) == 8)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.eight);
         }
         else if(Math.floor(this.seconds_left/10) == 9)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.nine);
         }
         if (this.first_person_mode)
        {
            timer_transform = model_transform.times(Mat4.translation([0.69, 2.078+1.5, -10]))
                                       //  .times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([0.0155*5, 0.0155, 0.05]));
        }
        if (this.third_person_mode)
        {
            timer_transform = model_transform.times(Mat4.translation([49, 7+1.5, -5]))
                                         //.times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1)))
                                         .times(Mat4.scale([1*5, 1, 2]));
        }        
         if(this.seconds_left%10 == 0)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.zero);
         }
         else if(this.seconds_left%10 == 1)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.one);
         }
         else if(this.seconds_left%10 == 2)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.two);
         }
         else if(this.seconds_left%10 == 3)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.three);
         }
         else if(this.seconds_left%10 == 4)
         {
              this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.four);
         }
         else if(this.seconds_left%10 == 5)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.five);
         }
         else if(this.seconds_left%10 == 6)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.six);
         }                        
         else if(this.seconds_left%10 == 7)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.seven);
         }
         else if(this.seconds_left%10 == 8)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.eight);
         }
         else if(this.seconds_left%10 == 9)
         {
               this.shapes.timer_bg.draw(graphics_state, timer_transform, this.materials.nine);
         }


         
            //this.shapes.text.set_string(timer_string, context);
            //this.shapes.text.draw(context, graphics_state, model_transform, this.materials.text_image);

        //else release robot alien to attack, keep timer at 0 (set string to 0:00)
       // this.shapes.timer_bg.draw(graphics_state, model_transform, this.materials.timer_bg);
    }
      
    intersect(sphere, box) // collsion detection
      {
          var x = Math.max(box.xMin, Math.min(sphere.position[0], box.xMax));
          var y = Math.max(box.yMin, Math.min(sphere.position[1], box.yMax));
          var z = Math.max(box.zMin, Math.min(sphere.position[2], box.zMax));

          var distance = Math.sqrt((x-sphere.position[0])*(x-sphere.position[0]) +
                                   (y-sphere.position[1])*(y-sphere.position[1]) +
                                   (z-sphere.position[2])*(z-sphere.position[2]));
          return distance < sphere.radius;
      }

      game_restart(graphics_state, size)
      {
          graphics_state.camera_transform = Mat4.inverse(this.initial_camera_location);
          this.intact_doors = [true,true,true,true,true,true,
                               true,true,true,true,true,true,true,
                               true,true,true,true,true,true,
                               true,true,true,true,true,true,true];            
          this.game_start = false;
          this.forward = false;
          this.backward = false;
          this.right = false;
          this.left = false;
          this.up = false;
          this.down = false;
          this.rotation_time = 0; // time for player rotation
          this.rotation_time_ud = 0; // time for player rotation
          this.player_direction = [0, 0.5, -1]; // direction that the player is facing
          this.player_move = [0, 0, 0]; // position of player wrt starting position
          this.player_pos = [ -0.5*this.s, 0, -1.5*this.s]; // position of player wrt world origin
          this.walk_time = 0; // for arm and leg position 

          this.player_pos = [ -0.5*this.s, 0, -1.5*this.s]; // position of player wrt world origin
          this.player = new Sphere(Mat4.translation(this.player_move).times(Mat4.translation([ -0.5*this.s, 0, -1.5*this.s]))
                            .times(Mat4.translation([0,.625*size,0])).times(Vec.of(0,0,0,1)), .2*size);


          this.time_left = this.game_length; //track time left in game
          this.minutes_left = this.game_length/60; //break down time left to minutes/seconds left
          this.seconds_left = this.game_length%60;
          this.display_timer = false; //toggle for timer display
          this.start_time_flag = false;

                    // robot position
          this.robot_pos = [[20, 0, 0], [75, 0, 62.5], [-15, 0, -35], [0, 0, 40], [0, 0, 60], [20, 0, 80], [45, 0, 75]];
          this.robot_dir = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];

          this.first_round = false;
          this.nuke_explosion_time = 0;

          this.reset = true;
          this.robot_move = [false, false, false, false, false, false, false];

      }

      //Making the nuke explode
      nuke_explosion(graphics_state, dt)
      {
           //Set an explosion timer
           this.nuke_explosion_time += dt;
           //Create an equation for the explosion to be drawn by
           let explosion_transform = Mat4.translation([-0.5*this.s, 0, -1.25*this.s ])
           .times(Mat4.scale([(0.1 + 1*this.nuke_explosion_time)*this.s, (0.1 + 10*this.nuke_explosion_time)*this.s, (0.1 + 10*this.nuke_explosion_time)*this.s]));
           //Draw the explosion
           this.shapes.explosion.draw(graphics_state, explosion_transform, this.materials.explosion);
           explosion_transform = Mat4.translation([-0.5*this.s, 0, -1.25*this.s ])
           .times(Mat4.scale([(0.1 + 10*(this.nuke_explosion_time + 1))*this.s, (0.1 + 10*(this.nuke_explosion_time + 1))*this.s, (0.1 + 10*(this.nuke_explosion_time + 1))*this.s]));
           //Draw the explosion
           this.shapes.explosion.draw(graphics_state, explosion_transform, this.materials.explosion);
           explosion_transform = Mat4.translation([-0.5*this.s, 0, -1.25*this.s ])
           .times(Mat4.scale([(0.1 + 10*(this.nuke_explosion_time*10))*this.s, (0.1 + 10*(this.nuke_explosion_time*10))*this.s, (0.1 + 10*(this.nuke_explosion_time*10))*this.s]));
           //Draw the explosion
           this.shapes.explosion.draw(graphics_state, explosion_transform, this.materials.explosion);
           explosion_transform = Mat4.translation([-0.5*this.s, 0, -1.25*this.s ])
           .times(Mat4.scale([(0.1 + 10*(this.nuke_explosion_time*100))*this.s, (0.1 + 10*(this.nuke_explosion_time*20))*this.s, (0.1 + 10*(this.nuke_explosion_time*100))*this.s]));
           //Draw the explosion
           this.shapes.explosion.draw(graphics_state, explosion_transform, this.materials.explosion);
      }
    //OUR MAIN DISPLAY
    display( graphics_state, context )
      { 

        //Draw the exit display
        this.shapes.window.draw(graphics_state, Mat4.translation([2.5*this.s, 0.8*this.t, this.s*16.99]).times(Mat4.scale([this.t/1.6, this.t/1.22, this.t/2])), this.materials.desert);

        this.walls = [];
        this.doors = [];
        this.floor_ceil = [];
        this.lights = [];
        this.boxes = [];
        this.robot_parts = [];
        this.lights = [];
        this.make_lights(graphics_state); // make light sources
            
        
        graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const time = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000; 
        let model_transform = Mat4.identity().times(Mat4.translation([0, 0.5*this.s, 0]));
        ///////////NOTE: These scalings are applied to squares that are already 2x2 units//////
        
        //door width and height are also subject to the scaling constants. width: a multiple of s, height: of t. 
        const door_width = 0.4;
        const door_height = 1.5;
        this.draw_floor(graphics_state, this.s, this.t);
        this.draw_walls(graphics_state,this.s,this.t,door_width, door_height);
        this.draw_doors(graphics_state,this.s,this.t,door_width, door_height);
        this.draw_box(graphics_state,this.s,this.t);
        this.draw_bloodybox(graphics_state, this.s);
        this.draw_window(graphics_state, this.s);
        this.draw_lights(graphics_state, time, this.t, this.s);
        this.draw_puddle(graphics_state, this.s,time);
        this.draw_robot(graphics_state, this.s, time, dt);
        this.draw_nuke(graphics_state,this.s,this.t, time);
        this.draw_rock(graphics_state, this.s);
        this.draw_missile_pack(graphics_state,this.s,this.t, time);


        if(this.bomb_thrown)
        {
            this.draw_bomb(graphics_state, this.s, this.t, dt);
        }
        
        if (this.game_start)
        {
          this.draw_player(graphics_state, this.s, dt, 1.5*door_height, time, context);
          if (this.start_time_flag)
          {
                this.get_start_time(time);
                this.start_time_flag = false;
          }      
          this.get_time_left(time);
          if(this.time_left <= 3)
          {
                this.nuke_explosion(graphics_state, dt);
          }
          if (this.time_left <= 0)
          {
              this.explodeDeath = true;
              this.game_start = false;
          }
        }
        else if (!this.reset)
        {
              this.game_restart(graphics_state, 1.5*door_height); 
        }

        //Explosion when a bomb collides
        if(this.explosion_detonated)
        {
              this.explosion(graphics_state, dt);
              this.particle_explosion(graphics_state, dt);
        }
        if(this.first_round && this.reset)
        {
             model_transform = this.initial_camera_location.times(Mat4.translation([0,0,-5])).times(Mat4.scale([2,2,1]));
             this.shapes.timer_bg.draw(graphics_state, model_transform, this.materials.start); 

        }
        else if(this.quitting && this.reset)
        {
             model_transform = this.initial_camera_location.times(Mat4.translation([0,0,-5])).times(Mat4.scale([2,2,1]));
             this.shapes.timer_bg.draw(graphics_state, model_transform, this.materials.quit); 

        }
        else if (this.explodeDeath && this.reset)
        {
             model_transform = this.initial_camera_location.times(Mat4.translation([0,0,-5])).times(Mat4.scale([2,2,1]));
             this.shapes.timer_bg.draw(graphics_state, model_transform, this.materials.exp); 

        }
        else if (this.escaped && this.reset)
        {
             model_transform = this.initial_camera_location.times(Mat4.translation([0,0,-5])).times(Mat4.scale([2,2,1]));
             this.shapes.timer_bg.draw(graphics_state, model_transform, this.materials.escape); 

        }
        else if (this.robotDeath && this.reset)
        {
             model_transform = this.initial_camera_location.times(Mat4.translation([0,0,-5])).times(Mat4.scale([2,2,1]));
             this.shapes.timer_bg.draw(graphics_state, model_transform, this.materials.robDeath); 
        }
      
      }
  }


class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
                                            // Sample the texture image in the correct place.
          float theta = mod(animation_time, 10.0);
          vec2 a = vec2((theta/5.0)*sin(theta), 0.0);
          vec4 tex_color = texture2D( texture, f_tex_coord - a);
                                                                                    // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}
