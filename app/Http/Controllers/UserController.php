<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:user-view', only: ['index', 'show']),
            new Middleware('permission:user-create', only: ['create', 'store']),
            new Middleware('permission:user-edit', only: ['edit', 'update']),
            new Middleware('permission:user-delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $users = User::with('roles')->latest()->paginate(10);
        return Inertia::render('user/index', ['users' => $users]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('user/create', ['roles' => $roles]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => $request->is_active ?? true,
        ]);

        if ($request->roles) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }

    public function show(User $user)
    {
        return Inertia::render('user/show', ['user' => $user->load('roles')]);
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        return Inertia::render('user/edit', [
            'user' => $user->load('roles'),
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active ?? true,
        ]);

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        if ($request->roles) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}
