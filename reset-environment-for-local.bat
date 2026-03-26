@echo off
echo Resetting environment for LOCAL...

php artisan migrate:fresh --seeder=LocalSeeder
php artisan wayfinder:generate
php artisan optimize:clear
php artisan optimize

echo Done!
pause