<?php

namespace App\Providers;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\PersonRepositoryInterface;
use App\Repositories\Contracts\MarriageRepositoryInterface;
use App\Repositories\Contracts\BranchRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\PersonRepository;
use App\Repositories\MarriageRepository;
use App\Repositories\BranchRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repository bindings
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PersonRepositoryInterface::class, PersonRepository::class);
        $this->app->bind(MarriageRepositoryInterface::class, MarriageRepository::class);
        $this->app->bind(BranchRepositoryInterface::class, BranchRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}


