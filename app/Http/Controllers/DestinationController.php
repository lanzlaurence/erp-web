<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use App\Models\Destination;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class DestinationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:destination-view', only: ['index', 'show']),
            new Middleware('permission:destination-create', only: ['create', 'store']),
            new Middleware('permission:destination-edit', only: ['edit', 'update']),
            new Middleware('permission:destination-delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $destinations = Destination::latest()->paginate(10);
        return Inertia::render('destination/index', ['destinations' => $destinations]);
    }

    public function create()
    {
        return Inertia::render('destination/create');
    }

    public function store(StoreDestinationRequest $request)
    {
        Destination::create($request->validated());
        return redirect()->route('destinations.index')->with('success', 'Destination created successfully');
    }

    public function edit(Destination $destination)
    {
        return Inertia::render('destination/edit', ['destination' => $destination]);
    }

    public function update(UpdateDestinationRequest $request, Destination $destination)
    {
        $destination->update($request->validated());
        return redirect()->route('destinations.index')->with('success', 'Destination updated successfully');
    }

    public function destroy(Destination $destination)
    {
        $destination->delete();
        return redirect()->route('destinations.index')->with('success', 'Destination deleted successfully');
    }
}
