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
use App\Repositories\Contracts\EventRepositoryInterface;
use App\Repositories\Contracts\NewsPostRepositoryInterface;
use App\Repositories\Contracts\MediaGalleryRepositoryInterface;
use App\Repositories\EventRepository;
use App\Repositories\NewsPostRepository;
use App\Repositories\MediaGalleryRepository;
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
        $this->app->bind(EventRepositoryInterface::class, EventRepository::class);
        $this->app->bind(NewsPostRepositoryInterface::class, NewsPostRepository::class);
        $this->app->bind(MediaGalleryRepositoryInterface::class, MediaGalleryRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}


