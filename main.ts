/*
 iotbit package
*/
 //% weight=10 icon="\uf013" color=#2896ff
namespace iotbit {
    export enum fanPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02,
    }

    export enum Servos {
        //% block="servo 1"
        Servo1 = 0x01,
        //% block="servo 2"
        Servo2 = 0x02
    }
     
    export enum Temp_humi {
        //% block="Temperature"
        Temperature = 0x01,
        //% block="Humidity"
        Humidity = 0x02
    }

    export enum TempSensor { 
        //% block="Port 4"
        port4 = 0x04           
    }

    export enum ultrasonicPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02
    }
     

    export enum busServoPort {
        //% block="Port 6"
        port6 = 0x06

    }

    export enum MusicName {
        //% block = "stop"
        Stop = 0x00,
        //% block="dadadum"
        Dadadum = 0x01,
        //% block="little star"
        Star = 0x02,      
        //% block="ringtone"
        Ring = 0x03,       
        //% block="brithday"
        Birth = 0x04,   
        //% block="wedding"        
        Wedding = 0x05,       
        //% block="jump up"
        JumpUp = 0x06,      
        //% block="jump down"
        JumpDown = 0x07,        
        //% block="power up"
        PowerUp = 0x08,      
        //% block="power down"
        PowerDown = 0x09             
    }
     

    export enum touchKeyPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02,
        //% block="Port 3"
        port3 = 0x03
    }


    export enum soilPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 3"
        port3 = 0x03
    }

    export enum IOTCmdType {
        //% block="led color"
        LED_COLOR = 1,
        //% block="Fan"
        FAN = 2,
        //% block="Servo"
        SERVO = 3,
        //% block="Buzzer"
        BUZZER = 4,
        //% block="Show"
        SHOW = 5,
        //% block="Temperature"
        TEMP = 6,
        //% block="Humidity"
        HUMI = 7,
        //% block="Light"
        LIGHT = 8,
        //% block="Enter touch"
        TOUCH_IN = 9,
        //% block="Quit touch"
        TOUCH_OUT = 10,        
        //% block="Ultrasonic"
        ULTRASONIC = 11,
        //% block="Shake"
        SHAKE = 12,
        //% block="Enter key check"
        KEY_IN = 13,
        //% block="Quit key check"
        KEY_OUT = 14,       
        //% block="Oriention"
        ORIENTION = 15,
        //% block="Sound"
        SOUND = 16,
        //% block="Battery level"
        BAT = 17,
        //% block="Soil humidity"
        SOIL_HUMI = 18,       
        //% block="APP start"
        START = 19
    }

    /**
     * IOTbit initialization, please execute at boot time
    */
    //% weight=100 blockId=iotbit_Init block="Initialize IOTbit"
    export function iotbit_Init() {
        iotbit_initRGBLight();
        serial.redirect(
            SerialPin.P12,
            SerialPin.P8,
            BaudRate.BaudRate115200);
         
        basic.forever(() => {
            getHandleCmd();
        });
        initTempHumiSensor();
        basic.pause(2000);
        
    }

    let handleCmd: string = "";
    let currentVoltage: number = 0;
    let volume: number = 0;
    let lhRGBLight: IOTRGBLight.LHIOTRGBLight;
    let servo1Angle: number = 0xfff;
    let servo2Angle: number = 0xfff;
    let MESSAGE_HEAD = 0xff;
    let MESSAGE_ANGLE = 0xfe; 

    let fan_oriention = 0;
    let fan_speed = 0;

    let P14_ad = 0;



    /**
    * Get the handle command.
    */
     
    function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        if (cnt == 0)
            return;
        let index = findIndexof(handleCmd, "$", 0);
        if (index != -1) {
            let cmd: string = handleCmd.substr(0, index);
            if (cmd.compare("START") == 0)
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.START);
            }
            else if (cmd.charAt(0).compare("A") == 0) {//彩灯颜色
                if (cmd.length == 7)
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    let arg2Int: number = strToNumber(cmd.substr(3, 2));
                    let arg3Int: number = strToNumber(cmd.substr(5, 2));
                    P14_ad = arg1Int;

                    if (arg3Int != -1) {
                        currentVoltage = arg3Int * 10353 / 400;
                        currentVoltage = Math.round(currentVoltage);
                    }

                    if (arg2Int != -1) {
                        volume = arg2Int;
                    }
                }
                else if (cmd.length == 9)
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    let arg2Int: number = strToNumber(cmd.substr(3, 2));
                    let arg3Int: number = strToNumber(cmd.substr(5, 2));
                    let arg4Int: number = strToNumber(cmd.substr(7, 2));
     
                    control.raiseEvent(MESSAGE_HEAD, IOTCmdType.LED_COLOR);
                    if (arg1Int != -1 && arg2Int != -1 && arg3Int != -1 && arg4Int != -1)
                        iotbit_setPixelRGBSerial(arg1Int, arg2Int, arg3Int, arg4Int);    
                }

            }
            else if (cmd.charAt(0).compare("B") == 0 && cmd.length == 4) {//风扇
                let arg1Int: number = strToNumber(cmd.substr(1, 1));
                let arg2Int: number = strToNumber(cmd.substr(2, 2));

                if (arg1Int != -1 && arg2Int != -1) {
                    fan_oriention = arg1Int;
                    fan_speed = arg2Int;
                    control.raiseEvent(MESSAGE_HEAD, IOTCmdType.FAN);
                }
            }
            else if (cmd.charAt(0).compare("C") == 0 && cmd.length == 9) {//舵机
                let arg1Int: number = strToNumber(cmd.substr(1, 2));//编号
                let arg2Int: number = strToNumber(cmd.substr(3, 2));//角度
                let arg3Int: number = strToNumber(cmd.substr(5, 4));//时间

                if (arg1Int != -1 && arg2Int != -1 && arg3Int != -1) {
                    setServo(arg1Int, arg2Int, arg3Int);
                }
            }
            else if (cmd.charAt(0).compare("D") == 0 && cmd.length == 3)//蜂鸣器
            {
                let arg1Int: number = strToNumber(cmd.substr(1, 2));
                if (arg1Int != -1)
                {
                    iotbit_sendSensorData(IOTCmdType.BUZZER,arg1Int);
                    iotbit_playTone(arg1Int);
                }    
            }
            else if (cmd.charAt(0).compare("E") == 0 && cmd.length == 3)//显示
            {
                let arg1Int: number = strToNumber(cmd.substr(1, 2));
                if (arg1Int != -1)
                {
                    iotbit_sendSensorData(IOTCmdType.SHOW,arg1Int);
                    iot_show_expressions(arg1Int);
                }    
            }
            else if (cmd.charAt(0).compare("F") == 0 && cmd.length == 1)//查询温度
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.TEMP);
            }
            else if (cmd.charAt(0).compare("G") == 0 && cmd.length == 1)//查询湿度
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.HUMI);
            }
            else if (cmd.charAt(0).compare("H") == 0 && cmd.length == 1)//查询光线
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.LIGHT);
            }
            else if (cmd.charAt(0).compare("I") == 0 && cmd.length == 2)//H触摸感应
            {
                let arg1Int: number = strToNumber(cmd.substr(1, 1));
                if(arg1Int == 2)
                    control.raiseEvent(MESSAGE_HEAD, IOTCmdType.TOUCH_IN);
                else if (arg1Int == 3)
                    control.raiseEvent(MESSAGE_HEAD, IOTCmdType.TOUCH_OUT);
                
            }
            else if (cmd.charAt(0).compare("J") == 0 && cmd.length == 1)//查询超声波
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.ULTRASONIC);
            }
            //K震动情况发送
            else if (cmd.charAt(0).compare("L") == 0 && cmd.length == 2)//A按键
            {
                let arg1Int: number = strToNumber(cmd.substr(1, 1));
                if(arg1Int == 3)
                    control.raiseEvent(MESSAGE_HEAD, IOTCmdType.KEY_IN);
                else if (arg1Int == 4)
                    control.raiseEvent(MESSAGE_HEAD, IOTCmdType.KEY_OUT);
            }   
            else if (cmd.charAt(0).compare("M") == 0 && cmd.length == 1)//查询方向
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.ORIENTION);
            }
            else if (cmd.charAt(0).compare("N") == 0 && cmd.length == 1)//查询音量
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.SOUND);
            }
            else if (cmd.charAt(0).compare("P") == 0 && cmd.length == 1)//查询土壤湿度
            {
                control.raiseEvent(MESSAGE_HEAD, IOTCmdType.SOIL_HUMI);
            }            
        }
        handleCmd = "";
    }


    function findIndexof(src: string, strFind: string, startIndex: number): number {
        for (let i = startIndex; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                return i;
            }
        }
        return -1;
    }
 
    function countChar(src: string, strFind: string): number {
        let cnt: number = 0;
        for (let i = 0; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                cnt++;
            }
        }
        return cnt;
    }
    
    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }

    function decStrToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 10;
            num += tmp;
        }
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }


    /**
    * Set the angle of bus servo 1 to 8, range of -120~120 degree
    */
    //% weight=98 blockId=iotbit_setBusServo block="Set bus servo|port %port|index %index|angle(-120~120) %angle|duration %duration"
    //% angle.min=-120 angle.max=120
    export function iotbit_setBusServo(port: busServoPort, index: number, angle: number, duration: number) {
        angle = angle * -1;
        if (angle > 120 || angle < -120) {
            return;
        }
    
        angle += 120;

        let position = mapRGB(angle, 0, 240, 0, 1000);
   
        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x08;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x01;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }
    
    /**
    * Set the number of the servo.
    */
    //% weight=96 blockId=iotbit_setBusServoNum block="Set bus servo|number %index|"
    export function iotbit_setBusServoNum(index: number) {
        let buf = pins.createBuffer(5);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x03;
        buf[3] = 0x36;//cmd type
        buf[4] = index;
        serial.writeBuffer(buf);
    }

    /**
     * Send read qdee servos angle command
     */
    //% weight=94 blockId=iotbit_readAngle block="Send read|%servo|angle command "
    export function iotbit_readAngle(servo: Servos) {
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x3E;//cmd type
        buf[4] = 0x05;
        buf[5] = servo;
        serial.writeBuffer(buf);
    }
   

    /**
     * Do someting when Qdee receive angle
     * @param body code to run when event is raised
     */
    //% weight=92 blockId=onIOTbit_getAngle block="On IOTbit|%servo|get angle"
    export function onIOTbit_getAngle(servo: Servos, body: Action) {
        control.onEvent(MESSAGE_ANGLE, servo, body);
    }

     
    /**
         * Do someting when Qdee receive remote-control code
         * @param code the ir key button that needs to be pressed
         * @param body code to run when event is raised
         */
    //% weight=90 blockId=onIOTbitGetCmd block="on IOTbit get|%code|Command"
    export function onIOTbitGetCmd(code: IOTCmdType, body: Action) {
        control.onEvent(MESSAGE_HEAD, code, body);
    }

    /**
     *  Get servos angle
     */
    //% weight=88 blockId=getServosAngle block="Get|%servo|angle(-120~120)"
    export function getServosAngle(servo: Servos): number {
        if (servo == Servos.Servo1) {
            return servo1Angle;
        }
        else if (servo == Servos.Servo2) {
            return servo2Angle;
        }
        else
            return 0xFFF;
    }


    /**
    * Set the angle of servo 1 to 8, range of 0~180 degree
    */
    //% weight=87 blockId=setServo block="Set pwm servo|index %index|angle(0~180) %angle|duration %duration"
    //% angle.min=0 angle.max=180
    export function setServo(index: number, angle: number, duration: number) {
        if (angle > 180 || angle < 0) {
            return;
        }
        let position = mapRGB(angle, 0, 180, 500, 2500);

        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x08;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x01;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }
    
    /**
    * Get the volume level detected by the sound sensor, range 0 to 255
    */
    //% weight=86 blockId=iotbit_getSoundVolume block="Sound volume"
    export function iotbit_getSoundVolume(): number {
        return volume;
    }

    /**
     *  Get IOTbit current voltage,the unit is mV
    */
    //% weight=84 blockGap=50 blockId=iotbit_getBatVoltage block="Get IOTbit current voltage (mV)"
    export function iotbit_getBatVoltage(): number {
        return currentVoltage;
    }

    

    /**
     * Set fan speed
     * @param speed the speed of the fan in -100~100. eg: 80
     */
    //% weight=82 blockId=iotbit_fan_speed block="Set the fan|port %port|speed %speed"
    //% speed.min=-100 speed.max=100
    export function iotbit_fan_speed(port: fanPort, speed: number) {
        let pin1Clock = 0;
        let pin2Clock = 0;
        if (speed > 100)
            speed = 100;
        else if (speed < -100)
            speed = -100;
        speed = speed * 1023 / 100;
        if (speed > 0)//正转
        {
            pin1Clock = speed;
        }
        else {
            pin2Clock = -1 * speed;
        }
        switch (port) {
            case fanPort.port1:
                pins.analogWritePin(AnalogPin.P1, pin1Clock);
                pins.analogWritePin(AnalogPin.P2, pin2Clock);
                break;
            case fanPort.port2:
                pins.analogWritePin(AnalogPin.P13, pin1Clock);
                pins.analogWritePin(AnalogPin.P14, pin2Clock);
                break;
        }
    }

     
    /**
     * App remote control the fan speed
     */
    //% weight=80 blockId=iotbit_setfan block="IOT remote control the fan %port"
    export function iotbit_setfan(port: fanPort) {
        let pin1Clock = 0;
        let pin2Clock = 0;
        if (fan_oriention == 1)
            fan_speed = -1 * fan_speed;
        fan_speed = Math.round(fan_speed * 1023 / 100);
        if (fan_speed > 0)//正转
        {
            pin1Clock = fan_speed;
        }
        else {
            pin2Clock = -1 * fan_speed;
        }
        switch (port) {
            case fanPort.port1:
                pins.analogWritePin(AnalogPin.P1, pin1Clock);
                pins.analogWritePin(AnalogPin.P2, pin2Clock);
                break;
            case fanPort.port2:
                pins.analogWritePin(AnalogPin.P13, pin1Clock);
                pins.analogWritePin(AnalogPin.P14, pin2Clock);
                break;
        }
    }
    /**
    * Get the condition of the touch button,press return 1,or return 0
    */
    //% weight=78 blockId=iotbit_touchButton block=" Touch button|port %port|is pressed"    
    export function iotbit_touchButton(port: touchKeyPort): boolean {
        let status: boolean = false;
        switch (port) {
            case touchKeyPort.port1:
                pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
                status = !pins.digitalReadPin(DigitalPin.P1);
                break;
            case touchKeyPort.port2:
                pins.setPull(DigitalPin.P13, PinPullMode.PullUp);
                status = !pins.digitalReadPin(DigitalPin.P13);
                break;
            case touchKeyPort.port3:
                if (P14_ad > 0xA)
                    status = false;
                else
                    status = true;
                break;
        }
        return status;
    }

    let distanceBak = 0;
    /**
     * Get the distance of ultrasonic detection to the obstacle 
     */
    //% weight=76 blockId=iotbit_ultrasonic  block="Ultrasonic|port %port|distance(cm)"
    export function iotbit_ultrasonic(port: ultrasonicPort): number {
        let trigPin: DigitalPin = DigitalPin.P1;
        let echoPin: DigitalPin = DigitalPin.P2;
        let distance: number = 0;
        let d: number = 0;
        switch (port) {
            case ultrasonicPort.port1:
                trigPin = DigitalPin.P1;
                echoPin = DigitalPin.P2;
                break;
            case ultrasonicPort.port2:
                trigPin = DigitalPin.P13;
                echoPin = DigitalPin.P14;
                break;
        }
        pins.setPull(echoPin, PinPullMode.PullNone);
        pins.setPull(trigPin, PinPullMode.PullNone);
                    
        // send pulse
        pins.digitalWritePin(trigPin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trigPin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trigPin, 0);
        // read pulse
        d = pins.pulseIn(echoPin, PulseValue.High, 15000);
        distance = d;
        // filter timeout spikes
        if (distance == 0 || distance >= 13920) {
            distance = distanceBak;
        }
        else
            distanceBak = d;

        return Math.round(distance * 10 / 6 / 58);
    }


    /**
	 * Initialize RGB
	 */
    function iotbit_initRGBLight() {
        if (!lhRGBLight) {
            lhRGBLight = IOTRGBLight.create(DigitalPin.P15, 2, IOTRGBPixelMode.RGB);
        }
        iotbit_clearLight();
    }

    /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="iotbit_setBrightness" block="set brightness %brightness"
    //% weight=74
    export function iotbit_setBrightness(brightness: number): void {
        lhRGBLight.setBrightness(brightness);
    }
    
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=72 blockId=iotbit_setPixelRGB block="Set|%lightoffset|color to %rgb"
    export function iotbit_setPixelRGB(lightoffset: IOTLights, rgb: IOTRGBColors) {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }
    

    /**
     * Set RGB Color argument
     */
    //% weight=70 blockId=iotbit_setPixelRGBArgs block="Set|%lightoffset|color to %rgb"
    export function iotbit_setPixelRGBArgs(lightoffset: IOTLights, rgb: number) {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }

    function iotbit_setPixelRGBSerial(lightoffset: number, r: number, g: number, b: number) {
        lhRGBLight.setPixelColorRGB(lightoffset, r, g, b);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=70 blockId=iotbit_showLight block="Show light"
    export function iotbit_showLight() {
        lhRGBLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=68 blockGap=50 blockId=iotbit_clearLight block="Clear light"
    export function iotbit_clearLight() {
        lhRGBLight.clear();
    }


    function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    
    /**
    * Set the Qdee show facial expressions
    */
    //% weight=66 blockId=iot_show_expressions block="Qdee show facial expressions %type"
    export function iot_show_expressions(type: number) {
        switch (type) {
            case 0:
                basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            `)
                break;

            case 1:
                basic.showIcon(IconNames.Heart);
                break;
            
            case 2:
                basic.showIcon(IconNames.Yes);
                break;
            
            case 3:
                basic.showIcon(IconNames.No);
                break;
            
            case 4:
                basic.showIcon(IconNames.Happy)
                break;
            
            case 5:
                basic.showIcon(IconNames.Sad)
                break;
            
            case 6:
                basic.showIcon(IconNames.Angry)
                break;
            
            case 7:
                basic.showLeds(`
            . . # . .
            . # # # .
            # . # . #
            . . # . .
            . . # . .
            `)
                break;
            
            case 8:
                basic.showLeds(`
            . . # . .
            . . # . .
            # . # . #
            . # # # .
            . . # . .
            `)
                break;
            
            case 9:
                basic.showLeds(`
            . . # . .
            . # . . .
            # # # # #
            . # . . .
            . . # . .
            `)
                break;
            
            case 10:
                basic.showLeds(`
            . . # . .
            . . . # .
            # # # # #
            . . . # .
            . . # . .
            `)
                break;
            
        }
    }
    
    /**
     * Set Qdee play tone
     */
    //% weight=64 blockId=iotbit_playTone block="IOTbit" play song|num %num|"
    export function iotbit_playTone(num: MusicName) {
        switch (num)
        {
            case MusicName.Stop:
                music.playTone(262, music.beat(BeatFraction.Sixteenth));
                break;
            case MusicName.Dadadum:
                music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once);
                break;
            
            case MusicName.Star:
                music.beginMelody(littleStarMelody(), MelodyOptions.Once)
                break;       
            
            case MusicName.Ring:
                music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once)
                break;          
            
            case MusicName.Birth:
                music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once)
                break; 
            
            case MusicName.Wedding:
                music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once)
                break; 
            
            case MusicName.JumpUp:
                music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once)
                break; 
            
            case MusicName.JumpDown:
                music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once)
                break; 
            
            case MusicName.PowerUp:
                music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
                break; 
            
            case MusicName.PowerDown:
                music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once)
                break; 
        }

    }

     function littleStarMelody(): string[] {
        return ["C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4"];
    }

    /**
     * Connect to the wifi
     */
    //% weight=62 blockId=iotbit_connectWifi block="Connect to the Wifi,name|%ssid|and password %passwrd"
    export function iotbit_connectWifi(ssid: string, passwrd: string) {
        let buf = pins.createBuffer(ssid.length + passwrd.length + 10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = (ssid.length + passwrd.length + 8) & 0xff;
        buf[3] = 0x3F;//cmd type
        buf[4] = 0x6;
        buf[5] = 0x22;
        for (let i = 0; i < ssid.length; i++) {
            buf[6 + i] = ssid.charCodeAt(i);
        }
        buf[ssid.length + 6] = 0x22;
        buf[ssid.length + 7] = 0x2C;
        buf[ssid.length + 8] = 0x22;
        for (let i = 0; i < passwrd.length; i++) {
            buf[ssid.length + 9 + i] = passwrd.charCodeAt(i);
        }
        buf[ssid.length + passwrd.length + 9] = 0x22;
        serial.writeBuffer(buf);
    }

    /**
     * Send sensor data 
     * 
     */
    //% weight=60 blockId="iotbit_sendSensorData" block="Send|%cmd|sensor data %data"
    export function iotbit_sendSensorData(cmd: IOTCmdType, data: number) {
        let cmdStr: string;
        switch (cmd) {
            case IOTCmdType.LED_COLOR:
                cmdStr = "A";
                break;
            case IOTCmdType.FAN:
                cmdStr = "B";
                break;
            case IOTCmdType.SERVO:
                cmdStr = "C";
                break;
            case IOTCmdType.BUZZER:
                cmdStr = "D";
                break;
            case IOTCmdType.SHOW:
                cmdStr = "E";
                break;
            case IOTCmdType.TEMP:
                cmdStr = "F";
                break;
            case IOTCmdType.HUMI:
                cmdStr = "G";
                break;
            case IOTCmdType.LIGHT:
                cmdStr = "H";
                break;
            case IOTCmdType.TOUCH_IN:
                cmdStr = "I";
                break;
            case IOTCmdType.TOUCH_OUT:
                cmdStr = "I";
                break;
            case IOTCmdType.ULTRASONIC:
                cmdStr = "J";
                break;
            case IOTCmdType.SHAKE:
                cmdStr = "K";
                break;
            case IOTCmdType.KEY_IN:
                cmdStr = "L";
                break;
            case IOTCmdType.KEY_OUT:
                cmdStr = "L";
                break;            
            case IOTCmdType.ORIENTION:
                cmdStr = "M";
                break;
            case IOTCmdType.SOUND:
                cmdStr = "N";
                break;
            case IOTCmdType.BAT:
                cmdStr = "O";
                break;
            case IOTCmdType.SOIL_HUMI:
                cmdStr = "P";
                break;

        }
        cmdStr += data.toString();
        cmdStr += "$";

        let buf = pins.createBuffer(cmdStr.length + 5);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = (cmdStr.length + 3) & 0xff;
        buf[3] = 0x3F;//cmd type
        buf[4] = 0x09;
        for (let i = 0; i < cmdStr.length; i++) {
            buf[5 + i] = cmdStr.charCodeAt(i);
        }
        serial.writeBuffer(buf);
    }

     //SHT31D_ErrorCode
     const SHT3XD_NO_ERROR = 0;

     const SHT3XD_CRC_ERROR = -101;
     const SHT3XD_TIMEOUT_ERROR = -102;
 
     const SHT3XD_PARAM_WRONG_MODE = -501;
     const SHT3XD_PARAM_WRONG_REPEATABILITY = -502;
     const SHT3XD_PARAM_WRONG_FREQUENCY = -503;
     const SHT3XD_PARAM_WRONG_ALERT = -504;
 
     // Wire I2C translated error codes
     const SHT3XD_WIRE_I2C_DATA_TOO_LOG = -10;
     const SHT3XD_WIRE_I2C_RECEIVED_NACK_ON_ADDRESS = -20;
     const SHT3XD_WIRE_I2C_RECEIVED_NACK_ON_DATA = -30;
     const SHT3XD_WIRE_I2C_UNKNOW_ERROR = -40;
 
     //SHT31D_Commands
     const SHT3XD_CMD_READ_SERIAL_NUMBER = 0x3780;
 
     const SHT3XD_CMD_READ_STATUS = 0xF32D;
     const SHT3XD_CMD_CLEAR_STATUS = 0x3041;
 
     const SHT3XD_CMD_HEATER_ENABLE = 0x306D;
     const SHT3XD_CMD_HEATER_DISABLE = 0x3066;
 
     const SHT3XD_CMD_SOFT_RESET = 0x30A2;
 
     const SHT3XD_CMD_CLOCK_STRETCH_H = 0x2C06;
     const SHT3XD_CMD_CLOCK_STRETCH_M = 0x2C0D;
     const SHT3XD_CMD_CLOCK_STRETCH_L = 0x2C10;
 
     const SHT3XD_CMD_POLLING_H = 0x2400;
     const SHT3XD_CMD_POLLING_M = 0x240B;
     const SHT3XD_CMD_POLLING_L = 0x2416;
 
     const SHT3XD_CMD_ART = 0x2B32;
 
     const SHT3XD_CMD_PERIODIC_HALF_H = 0x2032;
     const SHT3XD_CMD_PERIODIC_HALF_M = 0x2024;
     const SHT3XD_CMD_PERIODIC_HALF_L = 0x202F;
     const SHT3XD_CMD_PERIODIC_1_H = 0x2130;
     const SHT3XD_CMD_PERIODIC_1_M = 0x2126;
     const SHT3XD_CMD_PERIODIC_1_L = 0x212D;
     const SHT3XD_CMD_PERIODIC_2_H = 0x2236;
     const SHT3XD_CMD_PERIODIC_2_M = 0x2220;
     const SHT3XD_CMD_PERIODIC_2_L = 0x222B;
     const SHT3XD_CMD_PERIODIC_4_H = 0x2334;
     const SHT3XD_CMD_PERIODIC_4_M = 0x2322;
     const SHT3XD_CMD_PERIODIC_4_L = 0x2329;
     const SHT3XD_CMD_PERIODIC_10_H = 0x2737;
     const SHT3XD_CMD_PERIODIC_10_M = 0x2721;
     const SHT3XD_CMD_PERIODIC_10_L = 0x272A;
 
     const SHT3XD_CMD_FETCH_DATA = 0xE000;
     const SHT3XD_CMD_STOP_PERIODIC = 0x3093;
 
     const SHT3XD_CMD_READ_ALR_LIMIT_LS = 0xE102;
     const SHT3XD_CMD_READ_ALR_LIMIT_LC = 0xE109;
     const SHT3XD_CMD_READ_ALR_LIMIT_HS = 0xE11F;
     const SHT3XD_CMD_READ_ALR_LIMIT_HC = 0xE114;
 
     const SHT3XD_CMD_WRITE_ALR_LIMIT_HS = 0x611D;
     const SHT3XD_CMD_WRITE_ALR_LIMIT_HC = 0x6116;
     const SHT3XD_CMD_WRITE_ALR_LIMIT_LC = 0x610B;
     const SHT3XD_CMD_WRITE_ALR_LIMIT_LS = 0x6100;
 
     const SHT3XD_CMD_NO_SLEEP = 0x303E;
 
 
     const SHT3XD_ADDRESS = 0x44;
 
     let errocode = SHT3XD_NO_ERROR;
 
     function i2cwrite(value: number): number {
         let buf = pins.createBuffer(2);
         buf[0] = value >> 8;
         buf[1] = value & 0xff;
         let rvalue = pins.i2cWriteBuffer(SHT3XD_ADDRESS, buf);
         // serial.writeString("writeback:");
         // serial.writeNumber(rvalue);
         // serial.writeLine("");
         return rvalue;
     }
 
     function i2cread(): Buffer {
         let val = pins.i2cReadBuffer(SHT3XD_ADDRESS, 4);
         return val;
     }
 
     function initTempHumiSensor(): boolean {
         if (i2cwrite(SHT3XD_CMD_READ_SERIAL_NUMBER) != SHT3XD_NO_ERROR) {
             // serial.writeLine("111111")
             return false;
         }
 
         if (i2cwrite(SHT3XD_CMD_PERIODIC_10_H) != SHT3XD_NO_ERROR) {
             // serial.writeLine("222222")
             return false;
         }
 
         return true;
     }
 
     function readTempHumi(select: Temp_humi): number {
         if (i2cwrite(SHT3XD_CMD_FETCH_DATA) != SHT3XD_NO_ERROR) {
             // serial.writeLine("3333333")
             return 0;
         }
         let buf = i2cread();
         if (buf.length != 4) {
             // serial.writeLine("444444")
             return 0;
         }
         // serial.writeString("buf[0]:");
         // serial.writeNumber(buf[0]);
         // serial.writeLine("");
         // serial.writeString("buf[1]:");
         // serial.writeNumber(buf[1]);
         // serial.writeLine("");
         if (select == Temp_humi.Temperature) {
             let value1 = buf[0] * 256 + buf[1];
             let temp = 175.0 * value1 / 65535.0 - 45.0;
            //  serial.writeString("temp:");
            //  serial.writeNumber(temp);
            //  serial.writeLine("");
             temp *= 10;
             return Math.round(temp);
         }
         else {
             let value2 = buf[3] * 256 + buf[2];
             let humi = 100.0 * value2 / 65535.0;
            //  serial.writeString("humi:");
            //  serial.writeNumber(humi);
            //  serial.writeLine("");
             humi *= 10;
             return Math.round(humi);
         }
     }
 
     /**
      * Get sensor temperature and humidity
      */
     //% weight=58 blockId="iotbit_gettemperature" block="IOTbit|port %port|get %select"
     export function iotbit_gettemperature(port: TempSensor, select: Temp_humi): number {
         return readTempHumi(select);
    }
    

    /**
     * Get soil humidity
     */
    //% weight=56 blockId="iotbit_getsoilhumi" block="IOTbit|port %port|get soil humidity"
    export function iotbit_getsoilhumi(port: soilPort): number
    {
        let value: number = 0;
        if (port == soilPort.port1)
        {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 100);
        }
        else if (port == soilPort.port3)
        {
            value = P14_ad;
            value = mapRGB(value, 0, 255, 0, 100);
        }
        return Math.round(value);
    }
     
    /**
     * Get light level
     */
    //% weight=56 blockId="iotbit_getlightlevel" block="IOTbit|port %port|get light level"
    export function iotbit_getlightlevel(port: soilPort): number
    {
        let value: number = 0;
        if (port == soilPort.port1)
        {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 255);
        }
        else if (port == soilPort.port3)
        {
            value = P14_ad;
        }
        return Math.round(255 - value);
    }
}
