@echo off
echo Compilation du projet GESCOMP...

REM Créer le dossier target/classes s'il n'existe pas
if not exist "target\classes" mkdir "target\classes"

REM Compiler ArabicFontUtil.java d'abord
echo Compilation de ArabicFontUtil.java...
javac -d target\classes -cp "lib\*" src\main\java\com\afh\gescomp\util\ArabicFontUtil.java

REM Compiler StatistiquesServiceImpl.java
echo Compilation de StatistiquesServiceImpl.java...
javac -d target\classes -cp "target\classes;lib\*" src\main\java\com\afh\gescomp\implementation\StatistiquesServiceImpl.java

echo Compilation terminee.
pause 