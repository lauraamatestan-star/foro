<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            $table->string('google_id')->nullable()->unique()->after('avatar');
            $table->string('provider')->default('local')->after('google_id');
            $table->unsignedInteger('karma')->default(0)->after('provider');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'google_id', 'provider', 'karma']);
        });
    }
};
