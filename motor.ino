#include "HX711.h"


#define LEFT_PWM   5
#define RIGHT_PWM  6

#define LEFT_DIR   4
#define RIGHT_DIR  7


#define FAST_PWM 255
#define SLOW_PWM 230


#define LOADCELL_DOUT  3
#define LOADCELL_SCK   2

HX711 scale;


float calibration_factor = -7050.0;

void setup() {
  
  pinMode(LEFT_PWM, OUTPUT);
  pinMode(RIGHT_PWM, OUTPUT);
  pinMode(LEFT_DIR, OUTPUT);
  pinMode(RIGHT_DIR, OUTPUT);

  
  Serial.begin(9600);
  Serial.println("System starting...");

  
  scale.begin(LOADCELL_DOUT, LOADCELL_SCK);
  scale.tare();   
  Serial.println("Load cell tared");
}

void smoothDrive(int leftSpeed, int rightSpeed, int durationMs) {
  unsigned long startTime = millis();

  while (millis() - startTime < durationMs) {

  
    analogWrite(LEFT_PWM, FAST_PWM);
    analogWrite(RIGHT_PWM, FAST_PWM);
    delay(120);

    
    analogWrite(LEFT_PWM, leftSpeed);
    analogWrite(RIGHT_PWM, rightSpeed);
    delay(120);

    
    float weight = scale.get_units(5);
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" kg");
  }
}

void loop() {

  
  digitalWrite(LEFT_DIR, LOW);
  digitalWrite(RIGHT_DIR, LOW);
  smoothDrive(SLOW_PWM, SLOW_PWM, 5000);

  delay(500);


  digitalWrite(LEFT_DIR, LOW);
  digitalWrite(RIGHT_DIR, LOW);
  smoothDrive(0, SLOW_PWM, 2500);

  delay(500);

  
  digitalWrite(LEFT_DIR, HIGH);
  digitalWrite(RIGHT_DIR, HIGH);
  smoothDrive(SLOW_PWM, SLOW_PWM, 5000);

  
  analogWrite(LEFT_PWM, 0);
  analogWrite(RIGHT_PWM, 0);

  Serial.println("Demo complete");
  while (1); 
}
