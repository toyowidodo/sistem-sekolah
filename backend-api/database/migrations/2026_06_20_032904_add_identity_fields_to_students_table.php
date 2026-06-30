<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('parent_name');
            $table->string('religion')->nullable()->after('gender');
            $table->string('previous_school')->nullable()->after('religion');
            $table->string('father_name')->nullable()->after('phone');
            $table->string('mother_name')->nullable()->after('father_name');
            $table->string('father_job')->nullable()->after('mother_name');
            $table->string('mother_job')->nullable()->after('father_job');
            $table->string('parent_address_street')->nullable()->after('mother_job');
            $table->string('parent_address_village')->nullable()->after('parent_address_street');
            $table->string('parent_address_district')->nullable()->after('parent_address_village');
            $table->string('parent_address_city')->nullable()->after('parent_address_district');
            $table->string('parent_address_province')->nullable()->after('parent_address_city');
            $table->string('guardian_name')->nullable()->after('parent_address_province');
            $table->string('guardian_job')->nullable()->after('guardian_name');
            $table->text('guardian_address')->nullable()->after('guardian_job');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('parent_name')->nullable();
            $table->dropColumn([
                'religion', 'previous_school', 'father_name', 'mother_name',
                'father_job', 'mother_job', 'parent_address_street', 'parent_address_village',
                'parent_address_district', 'parent_address_city', 'parent_address_province',
                'guardian_name', 'guardian_job', 'guardian_address'
            ]);
        });
    }
};
