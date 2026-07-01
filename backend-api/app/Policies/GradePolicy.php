<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Grade;

class GradePolicy
{
    /**
     * Determine if user can view grades
     */
    public function view(User $user): bool
    {
        return $user->hasPermissionTo('manage-academic');
    }

    /**
     * Determine if user can create grades
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage-academic');
    }

    /**
     * Determine if user can update grades
     */
    public function update(User $user, Grade $grade): bool
    {
        return $user->hasPermissionTo('manage-academic');
    }

    /**
     * Determine if user can delete grades
     */
    public function delete(User $user, Grade $grade): bool
    {
        return $user->hasPermissionTo('manage-academic');
    }
}
