@echo off
echo Resetting environment for TEST...

php artisan migrate:fresh --seeder=TestSeeder
php artisan wayfinder:generate
php artisan optimize:clear
php artisan optimize

echo Done!
pause